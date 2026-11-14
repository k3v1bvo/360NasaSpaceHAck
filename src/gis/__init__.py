"""
GIS Data Processing Pipeline for GeoThermo-Twin AI.

This package provides modules for ingesting NASA Earth observation data,
performing spatial joins and zonal statistics on urban vector layers,
and computing heat-vulnerability risk indices for Bogotá's manzanas.

Modules:
    nasa_ingest  – Fetch LST, NDVI, and DEM rasters via earthaccess.
    spatial_join – Vector/raster spatial operations using GeoPandas.
    risk_index   – Heat Vulnerability Risk (HVR) calculation and alerting.
"""

from .nasa_ingest import NASADataClient
from .spatial_join import SpatialProcessor
from .risk_index import HeatVulnerabilityCalculator

__all__ = [
    "NASADataClient",
    "SpatialProcessor",
    "HeatVulnerabilityCalculator",
]
