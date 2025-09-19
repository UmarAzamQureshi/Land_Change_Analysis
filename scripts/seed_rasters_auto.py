import os
import sys
import hashlib
import subprocess
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor

# Reuse project settings for DB credentials
sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.config.settings import settings  # noqa: E402


RASTER_DIR = Path(__file__).resolve().parents[1] / "raster"

# Allow overriding paths via env vars; otherwise assume tools are on PATH
PSQL_PATH = os.getenv("PSQL_PATH", "psql")
RASTER2PGSQL_PATH = os.getenv("RASTER2PGSQL_PATH", "raster2pgsql")


def get_pg_env():
    """Environment for subprocess calls (supply PGPASSWORD non-interactively)."""
    env = os.environ.copy()
    if settings.POSTGRES_PASSWORD:
        env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
    return env


def get_psql_base_args():
    return [
        "-h",
        str(settings.POSTGRES_HOST or "localhost"),
        "-p",
        str(settings.POSTGRES_PORT or 5432),
        "-U",
        str(settings.POSTGRES_USER or "postgres"),
        "-d",
        str(settings.POSTGRES_DB or "postgres"),
    ]


def connect_pg():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        database=settings.POSTGRES_DB,
    )


def enable_postgis():
    conn = connect_pg()
    try:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
            cur.execute("CREATE EXTENSION IF NOT EXISTS postgis_raster;")
        conn.commit()
    finally:
        conn.close()


def ensure_tracking_table():
    conn = connect_pg()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS raster_imports (
                    id SERIAL PRIMARY KEY,
                    filename TEXT NOT NULL,
                    checksum TEXT NOT NULL,
                    table_name TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    UNIQUE(filename, checksum)
                );
                """
            )
        conn.commit()
    finally:
        conn.close()


def file_checksum(path: Path, chunk_size: int = 1024 * 1024) -> str:
    sha = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            sha.update(chunk)
    return sha.hexdigest()


def table_exists(table_name: str) -> bool:
    conn = connect_pg()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = %s
                );
                """,
                (table_name,),
            )
            return cur.fetchone()[0]
    finally:
        conn.close()


def has_been_imported(filename: str, checksum: str) -> bool:
    conn = connect_pg()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM raster_imports WHERE filename = %s AND checksum = %s LIMIT 1;",
                (filename, checksum),
            )
            return cur.fetchone() is not None
    finally:
        conn.close()


def record_import(filename: str, checksum: str, table_name: str) -> None:
    conn = connect_pg()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO raster_imports (filename, checksum, table_name)
                VALUES (%s, %s, %s)
                ON CONFLICT (filename, checksum) DO NOTHING;
                """,
                (filename, checksum, table_name),
            )
        conn.commit()
    finally:
        conn.close()


def sanitize_table_name(stem: str) -> str:
    safe = stem.lower().replace("-", "_").replace(" ", "_")
    # remove any characters not alnum or underscore
    safe = "".join(ch for ch in safe if ch.isalnum() or ch == "_")
    if not safe:
        raise ValueError("Invalid filename for table name")
    return safe


def import_raster(tif_path: Path) -> bool:
    """Run raster2pgsql -> psql pipeline. Returns True if imported, False if skipped."""
    filename = tif_path.name
    checksum = file_checksum(tif_path)
    table_name = sanitize_table_name(tif_path.stem)

    if has_been_imported(filename, checksum):
        print(f"Skip (already imported): {filename}")
        return False

    if table_exists(table_name):
        print(f"Skip (table exists): public.{table_name}")
        return False

    # Build command; on Windows the pipe is easier through shell
    psql_args = " ".join(get_psql_base_args())
    cmd = (
        f'"{RASTER2PGSQL_PATH}" -s 4326 -I -C -M "{tif_path}" public.{table_name} '
        f'| "{PSQL_PATH}" {psql_args}'
    )

    print(f"Importing {filename} -> public.{table_name} ...")
    subprocess.run(cmd, shell=True, check=True, env=get_pg_env())
    record_import(filename, checksum, table_name)
    print(f"Imported: {filename}")
    return True


def main():
    if not RASTER_DIR.exists():
        print(f"Raster directory not found: {RASTER_DIR}")
        sys.exit(1)

    enable_postgis()
    ensure_tracking_table()

    tif_files = sorted(RASTER_DIR.glob("*.tif"))
    if not tif_files:
        print("No .tif files found in raster directory.")
        return

    imported = 0
    for tif in tif_files:
        try:
            if import_raster(tif):
                imported += 1
        except subprocess.CalledProcessError as e:
            print(f"Failed to import {tif.name}: {e}")
        except Exception as e:
            print(f"Error processing {tif.name}: {e}")

    print(f"Done. Newly imported: {imported}. Total files scanned: {len(tif_files)}")


if __name__ == "__main__":
    main()


