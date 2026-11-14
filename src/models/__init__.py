"""
Módulo de Modelos Predictivos Físico-Neuronales (SciML)
Proyecto: GEO-COCHABAMBA 360 - Microclimas Urbanos con IA
"""

# Importación segura de ThermalComfortCalculator (puro Python/Matemático)
from .thermal_indices import ThermalComfortCalculator
from .sdf_encoder import SDFEncoder

# Importación condicional de modelos basados en PyTorch
try:
    from .local_fno import LocalFNO3D, SpectralConv3d
    from .pinns_solver import PINNSolver, DynamicPriorityBalancer
    TORCH_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    LocalFNO3D = None
    SpectralConv3d = None
    PINNSolver = None
    DynamicPriorityBalancer = None
    TORCH_AVAILABLE = False

__all__ = [
    "ThermalComfortCalculator",
    "SDFEncoder",
    "LocalFNO3D",
    "SpectralConv3d",
    "PINNSolver",
    "DynamicPriorityBalancer",
    "TORCH_AVAILABLE",
]
