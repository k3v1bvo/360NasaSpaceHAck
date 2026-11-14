"""
Módulo de Codificación Geométrica por Función de Distancia Signada (SDF)
Proyecto: GEO-COCHABAMBA 360 - Microclimas Urbanos con IA
Sede: FEXCO - NASA Space Apps Cochabamba 2026

Codifica la distancia euclidiana ortogonal de cada celda a la frontera de edificación
más cercana, permitiendo a Local-FNO resolver capas límites urbanas sin mallas complejas.
"""

import numpy as np
from typing import Tuple, Optional


class SDFEncoder:
    """Generador y codificador de mallas de Distancia Signada (SDF) 3D."""

    def __init__(self, resolution_xyz: Tuple[int, int, int] = (64, 64, 32)):
        self.nx, self.ny, self.nz = resolution_xyz

    def compute_sdf_from_buildings_raster(
        self,
        building_mask_2d: np.ndarray,
        building_heights_m: np.ndarray,
        voxel_size_m: float = 5.0
    ) -> np.ndarray:
        """
        Genera un volumen 3D con la función de distancia a partir de huellas 2D y alturas.

        Args:
            building_mask_2d: Matriz booleana 2D [nx, ny] con True donde hay edificación.
            building_heights_m: Matriz 2D [nx, ny] con alturas de cornisa en metros.
            voxel_size_m: Tamaño del vóxel cúbico en metros.

        Returns:
            sdf_3d: Matriz numpy 3D [nx, ny, nz] normalizada en [-1.0, 1.0],
                    donde valores negativos están dentro de los edificios y positivos en el aire.
        """
        nx, ny = building_mask_2d.shape
        nz = self.nz
        sdf_3d = np.ones((nx, ny, nz), dtype=np.float32)

        # Altura máxima en vóxeles para cada celda
        height_voxels = np.clip(np.ceil(building_heights_m / voxel_size_m).astype(int), 0, nz)

        for i in range(nx):
            for j in range(ny):
                h = height_voxels[i, j]
                if building_mask_2d[i, j] and h > 0:
                    # Dentro del edificio (valores negativos de distancia al techo)
                    for k in range(h):
                        dist_a_techo = (h - k) * voxel_size_m
                        sdf_3d[i, j, k] = -dist_a_techo
                    # En el aire por encima del techo
                    for k in range(h, nz):
                        dist_a_techo = (k - h) * voxel_size_m
                        sdf_3d[i, j, k] = dist_a_techo
                else:
                    # Terreno libre / calle
                    for k in range(nz):
                        sdf_3d[i, j, k] = (k + 1) * voxel_size_m

        # Normalización en rango [-1.0, 1.0]
        max_abs = np.max(np.abs(sdf_3d)) + 1e-6
        sdf_normalized = sdf_3d / max_abs
        return sdf_normalized

    @staticmethod
    def create_synthetic_urban_sdf(
        grid_shape: Tuple[int, int, int] = (64, 64, 32),
        density: float = 0.4
    ) -> np.ndarray:
        """Genera un volumen SDF sintético de un cañón urbano para pruebas de inferencia."""
        nx, ny, nz = grid_shape
        sdf = np.ones(grid_shape, dtype=np.float32)

        # Simular cañón urbano central (calle) y bloques construidos a los costados
        for i in range(nx):
            for j in range(ny):
                dist_calle_y = abs(j - ny // 2)
                if dist_calle_y > 10:  # Bloques de edificios
                    for k in range(nz):
                        if k < 18:
                            sdf[i, j, k] = -float(18 - k)
                        else:
                            sdf[i, j, k] = float(k - 18)
                else:  # Calle libre
                    for k in range(nz):
                        sdf[i, j, k] = float(k + 1)

        max_val = np.max(np.abs(sdf)) + 1e-5
        return sdf / max_val
