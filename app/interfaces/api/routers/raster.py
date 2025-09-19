
from app.config.settings import settings
import json
import base64
from fastapi import Query
from fastapi.responses import Response, JSONResponse
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import sql
import logging
from app.interfaces.schemas.raster import (
    RasterInfo, 
    RasterSummaryResponse,
    RasterBandInfo,
    RasterMetadata,
    RasterSpatialExtent,
    AnalysisRequest,
    AnalysisResponse,
    ClassPixelCount,
    FileAnalysisResponse,
    FileClassCount,
    DBClassCountsResponse,
    DBClassCount,
    AvailableYearsResponse,
    RasterOverlayResponse,
    
    
)
import numpy as np
import rasterio
from rasterio.io import MemoryFile

router = APIRouter(prefix="/raster", tags=["raster"])



def get_postgres_connection():
    """Get direct PostgreSQL connection for PostGIS queries"""
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database=settings.POSTGRES_DB
        )
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")


@router.get("/summary", response_model=RasterSummaryResponse)
async def get_raster_summary():
    """
    Get a summary of all raster datasets
    """
    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Find all raster tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (table_name LIKE '%islamabad%' OR table_name LIKE '%lulc%')
            AND table_name NOT IN ('raster_columns', 'raster_overviews')
            ORDER BY table_name;
        """)
        tables = [row['table_name'] for row in cur.fetchall()]
        
        if not tables:
            return RasterSummaryResponse(
                total_datasets=0,
                years_covered=[],
                data_consistency=True,
                total_tiles=0
            )
        
        years_covered = []
        total_tiles = 0
        band_counts = []
        srids = []
        
        for table in tables:
            year = table.split('_')[-1]
            years_covered.append(year)
            
            # Get tile count
            cur.execute(f"SELECT COUNT(*) as tile_count FROM {table};")
            tile_count = cur.fetchone()['tile_count']
            total_tiles += tile_count
            
            # Get band count and SRID
            cur.execute(f"""
                SELECT 
                    ST_NumBands(rast) as num_bands,
                    ST_SRID(rast) as srid
                FROM {table} 
                LIMIT 1;
            """)
            
            metadata = cur.fetchone()
            if metadata:
                band_counts.append(metadata['num_bands'])
                srids.append(metadata['srid'])
        
        # Check data consistency
        data_consistency = len(set(band_counts)) <= 1 and len(set(srids)) <= 1
        
        # Check NDVI capability
        ndvi_capable = all(band_count >= 2 for band_count in band_counts) if band_counts else False
        
        return RasterSummaryResponse(
            total_datasets=len(tables),
            years_covered=sorted(years_covered),
            data_consistency=data_consistency,
            total_tiles=total_tiles
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching raster summary: {str(e)}")
    finally:
        if conn:
            conn.close()


@router.get("/{year}/class-counts", response_model=DBClassCountsResponse)
async def get_class_counts(year: str):
    """
    Given a year, dynamically fetch raster table from Postgres/PostGIS,
    return raw raster metadata, pixel counts per class code,
    and unmapped values (if any).
    Nothing is hardcoded.
    """

    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 1. Find raster table by year
        cur.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name LIKE %s
            ORDER BY table_name;
            """,
            (f"%{year}",),
        )
        table_row = cur.fetchone()
        if not table_row:
            raise HTTPException(status_code=404, detail=f"No raster table found for year {year}")
        table = table_row["table_name"]

        # 2. Get raster dimensions (raw metadata)
        cur.execute(
            f"""
            SELECT ST_Width(rast) AS width,
                   ST_Height(rast) AS height,
                   ST_SRID(rast) AS srid,
                   ST_NumBands(rast) AS bands

            FROM {table}
            LIMIT 1;
            """
        )
        meta = cur.fetchone()
        if not meta:
            raise HTTPException(status_code=500, detail=f"Could not retrieve raster metadata for {table}")
        total_pixels = int(meta["width"] * meta["height"])

        # 3. Compute pixel counts by class code
        cur.execute(
            f"""
            WITH value_counts AS (
                SELECT (ST_ValueCount(rast)).*
                FROM {table}
            )
            SELECT value AS class_code, SUM(count) AS pixel_count
            FROM value_counts
            WHERE value IS NOT NULL
            GROUP BY value
            ORDER BY value;
            """
        )
        rows = cur.fetchall()

        # 4. Build response with class codes only (no hardcoded labels)
        class_counts = [
            DBClassCount(
                value=int(r["class_code"]),
                label=str(r["class_code"]),
                pixel_count=int(r["pixel_count"]),
                percentage=round((int(r["pixel_count"]) / total_pixels) * 100, 2)  # 👈 comma fixed
            )
            for r in rows if r["class_code"] is not None
        ]


        return DBClassCountsResponse(
            year=year,
            table_name=table,
            total_pixels=total_pixels,
            raster_metadata=meta,   # extra raw metadata included
            class_counts=class_counts,
            #unmapped_values=[]      # nothing unmapped since we don’t use labels
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing class counts for year {year}: {str(e)}")
    finally:
        if conn:
            conn.close()



@router.get("/{year}", response_model=RasterInfo)
async def get_raster_by_year(year: str):
    """
    Get detailed information about a specific raster dataset by year
    """
    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Find the table for the given year
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE %s
            ORDER BY table_name;
        """, (f"%{year}",))
        
        table_row = cur.fetchone()
        if not table_row:
            raise HTTPException(status_code=404, detail=f"No raster data found for year {year}")
        
        table = table_row['table_name']
        
        # Get basic table info
        cur.execute(f"SELECT COUNT(*) as tile_count FROM {table};")
        tile_count = cur.fetchone()['tile_count']
        
        # Get raster metadata using ST_MetaData
        cur.execute(f"""
            SELECT (md).width, (md).height, (md).numbands, (md).srid,
                   (md).upperleftx, (md).upperlefty,
                   (md).scalex, (md).scaley, (md).skewx, (md).skewy
            FROM (
                SELECT ST_MetaData(rast) AS md
                FROM {table}
                LIMIT 1
            ) foo;
        """)
        
        metadata_row = cur.fetchone()
        if not metadata_row:
            raise HTTPException(status_code=500, detail=f"Could not retrieve metadata for {table}")
            
        # Map to RasterMetadata (pixel_width/height derived from scalex/scaley)
        metadata = RasterMetadata(
            width=metadata_row['width'],
            height=metadata_row['height'],
            num_bands=metadata_row['numbands'],
            srid=metadata_row['srid'],
            upper_left_x=metadata_row['upperleftx'],
            upper_left_y=metadata_row['upperlefty'],
            scale_x=metadata_row['scalex'],
            scale_y=metadata_row['scaley'],
            skew_x=metadata_row['skewx'],
            skew_y=metadata_row['skewy'],
            pixel_width=metadata_row['scalex'],
            pixel_height=metadata_row['scaley']
        )
        
        # Get band information
        bands = []
        for band_num in range(1, metadata.num_bands + 1):
            cur.execute(f"""
                SELECT 
                    ST_BandPixelType(rast, {band_num}) as pixel_type,
                    ST_BandNoDataValue(rast, {band_num}) as nodata_value,
                    ST_SummaryStats(rast, {band_num}) as stats
                FROM {table}
                LIMIT 1;
            """)
            
            band_row = cur.fetchone()
            if band_row and band_row['stats']:
                stats_str = band_row['stats'].strip('()')
                stats = [float(x.strip()) for x in stats_str.split(',')]
                band_info = RasterBandInfo(
                    band_number=band_num,
                    pixel_type=band_row['pixel_type'],
                    nodata_value=band_row['nodata_value'],
                    min_value=stats[4] if len(stats) > 4 else None,  # min
                    max_value=stats[5] if len(stats) > 5 else None,  # max
                    mean_value=stats[2] if len(stats) > 2 else None,  # mean
                    std_dev=stats[3] if len(stats) > 3 else None     # stddev
                )
                bands.append(band_info)
        
        # Get spatial extent
        cur.execute(f"""
            SELECT ST_AsText(ST_Envelope(rast)) as envelope_wkt
            FROM {table}
            LIMIT 1;
        """)
        
        extent_row = cur.fetchone()
        if extent_row:
            spatial_extent = RasterSpatialExtent(
                extent=extent_row['envelope_wkt'],
                envelope_wkt=extent_row['envelope_wkt']
            )
        else:
            spatial_extent = None
        
        return RasterInfo(
            table_name=table,
            year=year,
            tile_count=tile_count,
            metadata=metadata,
            bands=bands,
            spatial_extent=spatial_extent
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching raster data for year {year}: {str(e)}")
    finally:
        if conn:
            conn.close()


async def _get_reference_year_totals(conn, reference_year: str, veg_codes: list, builtup_codes: list):
    """
    Helper function to get vegetation and built-up totals for a reference year
    """
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Find the table for the reference year
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE %s
            ORDER BY table_name;
        """, (f"%{reference_year}",))
        
        table_row = cur.fetchone()
        if not table_row:
            return None, None
        
        table = table_row['table_name']
        
        # Get pixel size in meters after reprojection to UTM (EPSG:32643)
        cur.execute(f"""
            SELECT 
                ST_PixelWidth(ST_Transform(rast, 32643)) as pixel_width_m,
                ST_PixelHeight(ST_Transform(rast, 32643)) as pixel_height_m
            FROM {table} 
            LIMIT 1;
        """)
        
        pixel_info = cur.fetchone()
        if not pixel_info:
            return None, None
        
        pixel_size_m2 = pixel_info['pixel_width_m'] * pixel_info['pixel_height_m']
        
        # Count pixels per class using ST_ValueCount on reprojected raster
        cur.execute(f"""
            WITH reprojected AS (
                SELECT ST_Transform(rast, 32643) as rast_utm
                FROM {table}
            ),
            value_counts AS (
                SELECT (ST_ValueCount(rast_utm)).*
                FROM reprojected
            )
            SELECT 
                value as class_code,
                count as pixel_count
            FROM value_counts
            WHERE value IS NOT NULL
            ORDER BY value;
        """)
        
        class_counts = cur.fetchall()
        
        # Calculate totals for reference year
        reference_vegetation_m2 = 0.0
        reference_builtup_m2 = 0.0
        
        for row in class_counts:
            class_code = int(row['class_code'])
            pixel_count = int(row['pixel_count'])
            area_m2 = pixel_count * pixel_size_m2
            
            # Add to vegetation or built-up totals
            if class_code in veg_codes:
                reference_vegetation_m2 += area_m2
            elif class_code in builtup_codes:
                reference_builtup_m2 += area_m2
        
        return reference_vegetation_m2, reference_builtup_m2
        
    except Exception as e:
        # If there's an error getting reference data, return None
        return None, None




@router.get("/{year}/ST_ValueCount")
async def get_ST_ValueCount(year: str):
   
    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 1. Find raster table for the given year
        cur.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name LIKE %s
            ORDER BY table_name;
            """,
            (f"%{year}",),
        )
        table_row = cur.fetchone()
        if not table_row:
            raise HTTPException(status_code=404, detail=f"No raster table found for year {year}")
        table = table_row["table_name"]


        cur.execute(f"SELECT DISTINCT (pvc).value FROM {table}, ST_ValueCount(rast,1) As pvc ORDER BY (pvc).value;")  
        rows = cur.fetchall()

        return {
            "Rows" : rows
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching raw data for year {year}: {str(e)}")
    finally:
        if conn:
            conn.close()


#Display the shapefile on the frontend 
# extract the shapefile of islamabad of all years we have in the db  
# After the shapefile is extracted assign the HEX colour code to the values that we get using ST_ValueCount
#ST_ValueCount will give the values assigned to the pixels and then as the Hex colour codes are assigned 




@router.get("/{year}/overlay.geojson")
async def get_raster_overlay_geojson(year: str):
    """
    Get vectorized overlay as GeoJSON for web display
    Useful for Leaflet choropleths
    """
    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor()

        # 1. Find raster/vector table
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name LIKE %s
            ORDER BY table_name
            LIMIT 1;
        """, (f"%{year}%",))

        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"No table found for year {year}")

        table = row[0]

        # 2. Find geometry column
        cur.execute("""
            SELECT f_geometry_column
            FROM geometry_columns
            WHERE f_table_schema = 'public'
              AND f_table_name = %s
            LIMIT 1;
        """, (table,))
        geom_row = cur.fetchone()
        if not geom_row:
            raise HTTPException(status_code=404, detail=f"No geometry column found in {table}")
        geom_col = geom_row[0]

        # 3. Build GeoJSON FeatureCollection
        cur.execute(sql.SQL("""
            SELECT jsonb_build_object(
                'type',     'FeatureCollection',
                'features', jsonb_agg(features.feature)
            )
            FROM (
              SELECT jsonb_build_object(
                  'type',       'Feature',
                  'geometry',   ST_AsGeoJSON({geom_col})::jsonb,
                  'properties', to_jsonb(inputs) - {geom_col}
              ) AS feature
              FROM (SELECT * FROM {table}) inputs
            ) features;
        """).format(
            table=sql.Identifier(table),
            geom_col=sql.Identifier(geom_col)
        ))

        geojson = cur.fetchone()[0]
        if not geojson:
            raise HTTPException(status_code=500, detail="GeoJSON generation failed")

        return JSONResponse(
            content=geojson,
            headers={
                "Content-Disposition": f"inline; filename=overlay_{year}.geojson",
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error generating GeoJSON overlay for {year}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating GeoJSON: {str(e)}")
    finally:
        if conn:
            conn.close()





# 🔑 ESRI LULC Class Legend
CLASS_LABELS = {
    0: "No Data",
    1: "Water",
    2: "Trees",
    3: "Grass",
    4: "Flooded Vegetation",
    5: "Crops",
    6: "Shrub/Scrub",
    7: "Built Area",
    8: "Bare Ground",
    9: "Snow/Ice",
    10: "Clouds",
    11: "Rangeland",
}

@router.get("/{year}/summary")
async def get_lulc_summary(year: str):
    """
    Combined endpoint: returns AOI geometry, class distribution, and meta info
    """

    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 1. Find raster table by year
        cur.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name LIKE %s
            ORDER BY table_name;
            """,
            (f"%{year}",),
        )
        table_row = cur.fetchone()
        if not table_row:
            raise HTTPException(status_code=404, detail=f"No raster table found for year {year}")
        table = table_row["table_name"]

        # 2. Get raster metadata (dimensions + pixel size + extent)
        cur.execute(f"""
            SELECT (md).width, (md).height, (md).numbands, (md).srid,
                   (md).upperleftx, (md).upperlefty,
                   (md).scalex, (md).scaley
            FROM (
                SELECT ST_MetaData(rast) AS md
                FROM {table}
                LIMIT 1
            ) foo;
        """)
        md = cur.fetchone()
        if not md:
            raise HTTPException(status_code=500, detail=f"Could not retrieve metadata for {table}")

        width, height = md["width"], md["height"]
        total_pixels = int(width * height)

        # Get extent polygon as GeoJSON
        cur.execute(f"""
            SELECT ST_AsGeoJSON(ST_Envelope(rast)) as geojson
            FROM {table}
            LIMIT 1;
        """)
        extent_row = cur.fetchone()
        aoi_geometry = extent_row["geojson"]

        # 3. Compute pixel counts by class
        cur.execute(f"""
            WITH value_counts AS (
                SELECT (ST_ValueCount(rast)).*
                FROM {table}
            )
            SELECT value AS class_code, SUM(count) AS pixel_count
            FROM value_counts
            WHERE value IS NOT NULL
            GROUP BY value
            ORDER BY value;
        """)
        class_rows = cur.fetchall()

        # 4. Prepare classes with labels + percentages
        classes = []
        for r in class_rows:
            code = int(r["class_code"])
            count = int(r["pixel_count"])
            percent = round((count / total_pixels) * 100, 2)
            label = CLASS_LABELS.get(code, f"Class {code}")
            classes.append({
                "code": code,
                "label": label,
                "count": count,
                "percent": percent
            })

        # 5. Compute pixel area (rough, based on scale in degrees)
        pixel_area_m2 = abs(md["scalex"] * md["scaley"]) * (111_320**2)  # deg → m² approx
        est_area_km2 = round((total_pixels * pixel_area_m2) / 1e6, 2)

        return {
    "type": "FeatureCollection",
    "features": [ 
        {
            "type": "Feature",
            "properties": {
                "name": "Islamabad",
                "classes": classes,
                "meta": {
                    "total_pixels": total_pixels,
                    "pixel_area_m2": round(pixel_area_m2, 2),
                    "estimated_area_km2": est_area_km2
                }
            },
            "geometry": aoi_geometry and eval(aoi_geometry),
        }
    ]
}


    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating summary for year {year}: {str(e)}")
    finally:
        if conn:
            conn.close()






#this
@router.get("/all-years/classes-geojson")
async def get_lulc_classes_all_years(tolerance: float = 0.0001):
    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Query directly from the combined table
        cur.execute("""
            SELECT year, jsonb_build_object(
                'type', 'FeatureCollection',
                'features', jsonb_agg(
                    jsonb_build_object(
                        'type', 'Feature',
                        'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, %s))::jsonb,
                        'properties', jsonb_build_object(
                            'code', class_code,
                            'year', year
                        )
                    )
                )
            ) AS geojson
            FROM lulc_classes_all_years
            GROUP BY year
            ORDER BY year
        """, (tolerance,))

        rows = cur.fetchall()
        return {row["year"]: row["geojson"] for row in rows}
    finally:
        if conn:
            conn.close()


















CLASS_LABELS = {
    1: "Water",
    2: "Trees",
    4: "Flooded Vegetation",
    5: "Crops",
    7: "Built Area",
    8: "Bare Ground",
    9: "Snow/Ice",
    10: "Clouds",
    11: "Rangeland",
}

@router.get("/{year}/classes-geojson")
async def get_lulc_classes_geojson(year: str, tolerance: float = 0.0001):
    
    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        precomputed_table = f"lulc_classes_{year}"

        # Check if precomputed table exists
        cur.execute(
            """
            SELECT EXISTS (
              SELECT 1 FROM information_schema.tables
              WHERE table_schema = 'public'
              AND table_name = %s
            );
            """,
            (precomputed_table,),
        )
        exists = cur.fetchone()["exists"]

        # If not exists → preprocess and create the table
        if not exists:
            # Find raster table
            cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name LIKE %s
                ORDER BY table_name;
                """,
                (f"%{year}",),
            )
            raster_table_row = cur.fetchone()
            if not raster_table_row:
                raise HTTPException(status_code=404, detail=f"No raster table found for {year}")
            raster_table = raster_table_row["table_name"]

            # Precompute polygons + store in permanent table
            cur.execute(f"""
                CREATE TABLE {precomputed_table} AS
                WITH polys AS (
                  SELECT
                    (gv).val AS class_code,
                    ST_MakeValid(ST_Union((gv).geom))::geometry(MultiPolygon, 4326) AS geom
                  FROM (
                    SELECT ST_DumpAsPolygons(rast) AS gv
                    FROM {raster_table}
                  ) foo
                  GROUP BY (gv).val
                )
                SELECT class_code, geom
                FROM polys
                WHERE geom IS NOT NULL;
            """)
            conn.commit()

        # Query from precomputed table with simplification
        cur.execute(f"""
            SELECT class_code,
                   ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, %s)) AS geom
            FROM {precomputed_table}
            WHERE geom IS NOT NULL;
        """, (tolerance,))
        rows = cur.fetchall()

        # Build GeoJSON
        features = []
        for r in rows:
            code = int(r["class_code"])
            label = CLASS_LABELS.get(code, f"Class {code}")
            features.append({
                "type": "Feature",
                "properties": {
                    "code": code,
                    "label": label
                },
                "geometry": json.loads(r["geom"])  
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating polygons for {year}: {str(e)}"
        )
    finally:
        if conn:
            conn.close()







@router.get("/all-years/classes-geojson")
async def get_lulc_classes_all_years(tolerance: float = 0.0001):
    conn = None
    try:
        conn = get_postgres_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT year,
                   jsonb_build_object(
                       'type', 'FeatureCollection',
                       'features', jsonb_agg(
                           jsonb_build_object(
                               'type', 'Feature',
                               'geometry', ST_AsGeoJSON(
                                   ST_SimplifyPreserveTopology(geom, %s)
                               )::jsonb,
                               'properties', jsonb_build_object(
                                   'code', class_code,
                                   'label', class_name,  -- ✅ add label like single-year
                                   'year', year
                               )
                           )
                       )
                   ) AS geojson
            FROM lulc_classes_all_years
            GROUP BY year
            ORDER BY year
        """, (tolerance,))

        rows = cur.fetchall()
        # { "2020": {FeatureCollection}, "2021": {FeatureCollection}, ... }
        return {str(row["year"]): row["geojson"] for row in rows}
    finally:
        if conn:
            conn.close()




