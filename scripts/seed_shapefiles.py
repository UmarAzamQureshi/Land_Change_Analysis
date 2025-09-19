import hashlib
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List
import argparse

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.infrastructure.db.models import ShapefileImport
from app.infrastructure.db.session import SessionLocal


SUPPORTED_EXTENSIONS = {'.shp'}


@dataclass
class ShapefileSet:
    base_path: Path

    @property
    def shp(self) -> Path:
        return self.base_path.with_suffix('.shp')

    @property
    def shx(self) -> Path:
        return self.base_path.with_suffix('.shx')

    @property
    def dbf(self) -> Path:
        return self.base_path.with_suffix('.dbf')

    @property
    def prj(self) -> Path:
        return self.base_path.with_suffix('.prj')

    def exists(self) -> bool:
        return self.shp.exists() and self.shx.exists() and self.dbf.exists()


def compute_checksum(paths: Iterable[Path]) -> str:
    sha = hashlib.sha256()
    for path in sorted(paths):
        with open(path, 'rb') as f:
            while True:
                chunk = f.read(1024 * 1024)
                if not chunk:
                    break
                sha.update(chunk)
    return sha.hexdigest()


def find_shapefile_sets(directory: Path) -> List[ShapefileSet]:
    sets: dict[str, ShapefileSet] = {}
    for shp in directory.rglob('*.shp'):
        base = shp.with_suffix('')
        candidate = ShapefileSet(base)
        if candidate.exists():
            sets[str(base)] = candidate
    return list(sets.values())


def ogr2ogr_import(shapefile: Path, table_name: str, srid: int | None = None) -> None:
    pg_conn = (
        f"PG:host={settings.POSTGRES_HOST} port={settings.POSTGRES_PORT} "
        f"dbname={settings.POSTGRES_DB} user={settings.POSTGRES_USER} password={settings.POSTGRES_PASSWORD}"
    )
    cmd = [
        'ogr2ogr',
        '-f', 'PostgreSQL',
        pg_conn,
        str(shapefile),
        '-nln', table_name,
        '-nlt', 'PROMOTE_TO_MULTI',
        '-lco', 'GEOMETRY_NAME=geom',
        '-lco', 'FID=id',
        '-overwrite'
    ]
    if srid:
        cmd.extend(['-a_srs', f'EPSG:{srid}'])
    subprocess.check_call(cmd)


def to_safe_table_name(name: str) -> str:
    cleaned = ''.join(ch if (ch.isalnum() or ch == '_') else '_' for ch in name)
    cleaned = cleaned.lower()
    while '__' in cleaned:
        cleaned = cleaned.replace('__', '_')
    return cleaned.strip('_')


def main() -> int:
    parser = argparse.ArgumentParser(description='Seed shapefiles into PostGIS, skipping duplicates.')
    parser.add_argument('--dir', dest='directory', default=None, help='Directory to scan for shapefiles')
    args = parser.parse_args()

    default_dir = Path(os.getcwd()) / 'islamabad_shapefiles'
    env_dir = os.getenv('SHAPEFILES_DIR')
    chosen_dir = args.directory or env_dir or str(default_dir)

    base_dir = Path(chosen_dir)
    if not base_dir.exists():
        print(f"Directory not found: {base_dir}")
        return 1

    print(f"Scanning directory: {base_dir}")
    shapefile_sets = find_shapefile_sets(base_dir)
    if not shapefile_sets:
        print("No shapefiles found.")
        return 0

    db: Session = SessionLocal()
    try:
        for sset in shapefile_sets:
            layer_name = sset.shp.stem
            table_name = to_safe_table_name(layer_name)
            checksum = compute_checksum([sset.shp, sset.shx, sset.dbf, sset.prj] if sset.prj.exists() else [sset.shp, sset.shx, sset.dbf])

            exists_stmt = select(ShapefileImport).where(
                ShapefileImport.filename == sset.shp.name,
                ShapefileImport.checksum == checksum,
            )
            if db.execute(exists_stmt).scalar_one_or_none() is not None:
                print(f"Skipping already imported: {sset.shp.name}")
                continue

            print(f"Importing {sset.shp} -> {table_name}")
            ogr2ogr_import(sset.shp, table_name)

            db.add(ShapefileImport(
                filename=sset.shp.name,
                checksum=checksum,
                layer_name=layer_name,
                table_name=table_name,
            ))
            db.commit()

        return 0
    finally:
        db.close()


if __name__ == '__main__':
    sys.exit(main())


