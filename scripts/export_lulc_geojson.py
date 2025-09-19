import os
import sys
import json
from urllib.parse import urlparse
import psycopg2

# Ensure project root is importable when running as a script
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.config.settings import settings


def get_connection_params():
    host = settings.POSTGRES_HOST
    port = settings.POSTGRES_PORT
    user = settings.POSTGRES_USER
    password = settings.POSTGRES_PASSWORD
    dbname = settings.POSTGRES_DB

    # If specific vars are missing, try parsing DATABASE_URL
    if not all([host, user, dbname]) and getattr(settings, "DATABASE_URL", None):
        parsed = urlparse(settings.DATABASE_URL)
        host = host or parsed.hostname or "localhost"
        port = port or (parsed.port or 5432)
        user = user or (parsed.username or "postgres")
        password = password or (parsed.password or "")
        # path starts with '/'
        db_from_url = parsed.path[1:] if parsed.path and len(parsed.path) > 1 else None
        dbname = dbname or (db_from_url or "postgres")

    # Final fallbacks
    host = host or "localhost"
    port = port or 5432
    user = user or "postgres"
    password = password or ""
    dbname = dbname or "postgres"

    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "dbname": dbname,
    }


def export_geojson(output_dir: str = "geojson_exports") -> None:
    os.makedirs(output_dir, exist_ok=True)

    conn = psycopg2.connect(**get_connection_params())
    cur = conn.cursor()

    try:
        cur.execute("SELECT DISTINCT year FROM lulc_classes_all_years ORDER BY year;")
        years = [row[0] for row in cur.fetchall()]

        for year in years:
            print(f"Exporting {year}...")
            cur.execute(
                """
                SELECT jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(
                        jsonb_build_object(
                            'type', 'Feature',
                            'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.001))::jsonb,
                            'properties', jsonb_build_object(
                                'code', class_code,
                                'year', year
                            )
                        )
                    )
                )
                FROM lulc_classes_all_years
                WHERE year = %s AND class_code <> 0;
                """,
                (year,),
            )
            geojson = cur.fetchone()[0]

            out_path = os.path.join(output_dir, f"lulc_classes_{year}.geojson")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(geojson, f, ensure_ascii=False)

            print(f"Saved: {out_path}")
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    export_geojson()


