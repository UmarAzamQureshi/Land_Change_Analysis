Created a router for Raster
 ==================================================================================
Schemas: routers/raster.py
Routes:
    raster/summery/ Get Raster Summery 

Working Explained:
    - Establish connection to PostGIS
    - Used Cursor so that we get Dicts not tuples
    - Qurey to search all the raster tabeles from db(gisdb)
    - Store the retrived data and display 
 ==================================================================================
Schemas: raster.py
Routes:
    routers/raster/{year}

Working Explained:
    - Establish connection to PostGIS.
    - Used Cursor so that we get Dicts not tuples.
    - Find the table for the given year.
    - Get raster metadata using ST_MetaData(built in function of PostGIS refrence 
        link:https://postgis.net/docs/RT_ST_MetaData.html).
    - Map to RasterMetadata (pixel_width/height derived from scalex/scaley).
    - Get band information.
    - Get spatial extent.
 ==================================================================================

Schemas: raster.py 
Routes:
    routers/raster/Analysis

 Working Explained:
    - Qurey to Get table of refrence 
    - Reprojecting to UTM → ensures pixel size is in meters.
    - Getting pixel size → so you can compute real-world area (pixel_size_m²).
    - Counting pixels per class → using ST_ValueCount refrence 
      link:(https://postgis.net/docs/RT_ST_ValueCount.html).
    - Multiplying pixel_count × pixel_size_m² → to get areas.
    - Aggregating vegetation and built-up totals based on codes.
    - Calculating percentages and changes over years.
 ==================================================================================