from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class RasterBandInfo(BaseModel):
    band_number: int
    pixel_type: str
    nodata_value: Optional[float]
    min_value: Optional[float]
    max_value: Optional[float]
    mean_value: Optional[float]
    std_dev: Optional[float]


class RasterMetadata(BaseModel):
    width: int
    height: int
    num_bands: int
    srid: int
    upper_left_x: float
    upper_left_y: float
    pixel_width: float
    pixel_height: float
    scale_x: float
    scale_y: float
    skew_x: float
    skew_y: float


class RasterSpatialExtent(BaseModel):
    extent: str
    envelope_wkt: str


class RasterInfo(BaseModel):
    table_name: str
    year: str
    tile_count: int
    metadata: RasterMetadata
    bands: List[RasterBandInfo]
    spatial_extent: RasterSpatialExtent
    created_at: Optional[datetime] = None


class RasterListResponse(BaseModel):
    total_rasters: int
    years_covered: List[str]
    rasters: List[RasterInfo]


class RasterSummaryResponse(BaseModel):
    total_datasets: int
    years_covered: List[str]
    data_consistency: bool
    total_tiles: int


class ClassPixelCount(BaseModel):
    class_code: int
    pixel_count: int
    area_m2: float
    area_km2: float
    area_hectares: float


class AnalysisRequest(BaseModel):
    year: str
    reference_year: Optional[str] = None  # Reference year for percentage calculations
    veg_codes: List[int] = [1, 2, 3, 4, 5]  # Default vegetation codes
    builtup_codes: List[int] = [6, 7, 8, 9, 10, 11]  # Default built-up codes


class AnalysisResponse(BaseModel):
    year: str
    table_name: str
    total_pixels: int
    pixel_size_m2: float
    class_breakdown: List[ClassPixelCount]
    vegetation_total: Dict[str, float]  # m2, km2, hectares
    builtup_total: Dict[str, float]     # m2, km2, hectares
    total_area_m2: float
    total_area_km2: float
    total_area_hectares: float
    reference_year: Optional[str] = None
    vegetation_change_percentage: Optional[float] = None  # Percentage change from reference year
    builtup_change_percentage: Optional[float] = None     # Percentage change from reference year

    
class FileClassCount(BaseModel):
    value: int
    label: str
    pixel_count: int


class FileAnalysisResponse(BaseModel):
    total_pixels: int
    width: int
    height: int
    nodata_value: Optional[float] = None
    class_counts: List[FileClassCount]
    #unmapped_values: List[int]


class DBClassCount(BaseModel):
    value: int
    label: str
    pixel_count: int
    percentage: float


class DBClassCountsResponse(BaseModel):
    year: str
    table_name: str
    total_pixels: int
    class_counts: List[DBClassCount]
    #unmapped_values: List[int]


class RasterOverlayResponse(BaseModel):
    year: str
    table: str
    bounds: List[float]  # [minx, miny, maxx, maxy]
    overlay_url: str

class AvailableYearsResponse(BaseModel):
    years: List[str]
    total_datasets: int