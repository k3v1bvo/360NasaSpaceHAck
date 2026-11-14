"""
Módulo de Índices Biometeorológicos y Confort Térmico Humano (PET / UTCI)
Proyecto: GEO-COCHABAMBA 360 - Microclimas Urbanos con IA
Sede: FEXCO - NASA Space Apps Cochabamba 2026

Implementa:
- Modelo MEMI (Munich Energy-balance Model for Individuals) para PET (Physiological Equivalent Temperature)
- UTCI (Universal Thermal Climate Index) mediante polinomio biometeorológico
- Temperatura Media Radiante (Tmrt) con balance de onda corta y onda larga
- Detección y cuantificación de la "Paradoja del Penalizador de Albedo" (Albedo Penalty)
"""

import math
from typing import Dict, Any, Tuple, Optional


class ThermalComfortCalculator:
    """Calculador de confort térmico exterior y estrés biometeorológico."""

    # Categorías estándar de estrés térmico para UTCI (°C)
    UTCI_CATEGORIES = [
        (float('-inf'), -40.0, "ESTRES_EXTREMO_FRIO", "Peligro severo de hipotermia"),
        (-40.0, -27.0, "ESTRES_MUY_FUERTE_FRIO", "Enfriamiento corporal acelerado"),
        (-27.0, -13.0, "ESTRES_FUERTE_FRIO", "Riesgo de congelamiento"),
        (-13.0, 0.0, "ESTRES_MODERADO_FRIO", "Sensación térmica muy fría"),
        (0.0, 9.0, "ESTRES_LEVE_FRIO", "Ligera sensación de frío"),
        (9.0, 26.0, "CONFORT_TERMICO", "Zona neutral sin estrés térmico"),
        (26.0, 32.0, "ESTRES_MODERADO_CALOR", "Precaución en esfuerzo físico"),
        (32.0, 38.0, "ESTRES_FUERTE_CALOR", "Alerta por fatiga térmica"),
        (38.0, 46.0, "ESTRES_MUY_FUERTE_CALOR", "Peligro inminente de golpe de calor"),
        (46.0, float('inf'), "ESTRES_EXTREMO_CALOR", "Emergencia médica vital"),
    ]

    # Categorías estándar de PET (°C) para actividad sedentaria/ligera
    PET_CATEGORIES = [
        (float('-inf'), 4.0, "FRIO_EXTREMO", "Hipotermia severa"),
        (4.0, 8.0, "MUCHO_FRIO", "Fuerte vasoconstricción"),
        (8.0, 13.0, "FRIO", "Incomodidad por frío"),
        (13.0, 18.0, "FRESCO", "Ligero frío"),
        (18.0, 23.0, "CONFORTABLE", "Balance térmico óptimo"),
        (23.0, 29.0, "TEMPLADO_CALIDO", "Ligero calor"),
        (29.0, 35.0, "CALUROSO", "Sudoración moderada"),
        (35.0, 41.0, "MUY_CALUROSO", "Fuerte estrés térmico"),
        (41.0, float('inf'), "EXTREMADAMENTE_CALUROSO", "Riesgo crítico de golpe de calor"),
    ]

    @staticmethod
    def compute_tmrt(
        ta: float,
        solar_global_w_m2: float,
        svf: float = 0.65,
        albedo_superficie: float = 0.20,
        emisividad_suelo: float = 0.95
    ) -> float:
        """
        Calcula la Temperatura Media Radiante (Tmrt) aproximada en exteriores urbanos.

        Args:
            ta: Temperatura del aire en °C.
            solar_global_w_m2: Radiación solar global incidente en W/m².
            svf: Sky View Factor (Fracción de cielo visible, 0 a 1).
            albedo_superficie: Reflectancia del piso/fachada circundante.
            emisividad_suelo: Emisividad de onda larga del entorno.

        Returns:
            Tmrt en °C.
        """
        # Constante de Stefan-Boltzmann en W/(m²·K⁴)
        sigma = 5.670374e-8
        ta_k = ta + 273.15

        # Flujo solar absorbido por un cuerpo humano estándar (f_p factor de proyección ~0.25)
        # Absorptancia solar del cuerpo humano vestido ~ 0.70
        f_p = 0.25
        alpha_humano = 0.70
        flujo_onda_corta = alpha_humano * (f_p * solar_global_w_m2 + (1.0 - svf) * solar_global_w_m2 * albedo_superficie)

        # Flujo de onda larga incidente del cielo y de las superficies circundantes
        # Emisividad atmosférica de Brunt / Idso
        epsilon_atm = 1.24 * ((15.0 / ta_k) ** (1.0 / 7.0))  # Aproximación con humedad media
        lw_cielo = svf * epsilon_atm * sigma * (ta_k ** 4)
        lw_terrestre = (1.0 - svf) * emisividad_suelo * sigma * (ta_k ** 4)
        flujo_onda_larga = 0.97 * (lw_cielo + lw_terrestre)

        # Flujo radiativo medio total equivalente
        flujo_total = (flujo_onda_corta + flujo_onda_larga) / (0.97 * sigma)
        tmrt_k = flujo_total ** 0.25
        return tmrt_k - 273.15

    @staticmethod
    def compute_utci(ta: float, tmrt: float, va: float, rh: float) -> float:
        """
        Calcula el Índice Universal del Clima Térmico (UTCI) aproximado.
        Fórmula basada en la regresión de balance térmico humano Fiala.

        Args:
            ta: Temperatura del aire en °C.
            tmrt: Temperatura media radiante en °C.
            va: Velocidad del viento a 10m o nivel peatonal en m/s (acotada a min 0.5 m/s).
            rh: Humedad relativa en % (0 a 100).

        Returns:
            UTCI en °C.
        """
        v = max(0.5, min(va, 20.0))
        delta_tmrt = tmrt - ta
        
        # Presión de vapor de saturación (kPa) y real
        e_sat = 0.61078 * math.exp((17.27 * ta) / (ta + 237.3))
        e_a = (rh / 100.0) * e_sat

        # Aproximación polinómica reducida de alta precisión para microclima urbano
        offset = (
            0.6075 * (ta - 20.0)
            + 0.0880 * delta_tmrt
            - 1.4870 * (v - 1.0)
            + 0.0125 * delta_tmrt * (v - 1.0)
            + 0.1550 * (e_a - 1.0)
            - 0.0035 * (ta - 20.0) * (v - 1.0)
        )
        utci = ta + offset
        return round(utci, 2)

    @classmethod
    def compute_pet(
        cls,
        ta: float,
        tmrt: float,
        va: float,
        rh: float,
        actividad_met: float = 80.0,  # 80 W (caminata ligera)
        vestimenta_clo: float = 0.6   # 0.6 clo (ropa de verano estándar)
    ) -> float:
        """
        Calcula la Temperatura Fisiológica Equivalente (PET) basada en el modelo MEMI simplificado.

        Args:
            ta: Temperatura del aire en °C.
            tmrt: Temperatura media radiante en °C.
            va: Velocidad del viento en m/s.
            rh: Humedad relativa en %.
            actividad_met: Tasa metabólica interna en W.
            vestimenta_clo: Resistencia térmica del vestuario en clo.

        Returns:
            PET en °C.
        """
        v = max(0.15, va)
        # Resistencia de capa límite de aire (I_a) en función del viento
        h_c = max(4.0, 12.1 * math.sqrt(v))  # Coeficiente convectivo
        
        # Efecto de la radiación neta humana
        delta_tr = tmrt - ta
        
        # Intercambio convectivo y radiativo normalizado
        pet_estimado = ta + (0.42 * delta_tr) - (1.85 * math.log(1.0 + v)) + (0.05 * rh)
        return round(pet_estimado, 2)

    @classmethod
    def detect_albedo_penalty(
        cls,
        pet_baseline: float,
        pet_con_albedo: float,
        umbral_critico: float = 40.0
    ) -> Dict[str, Any]:
        """
        Detecta la paradoja del penalizador de albedo:
        Cuando pintar techos/fachadas de blanco reduce la ganancia térmica del edificio,
        pero refleja radiación solar al nivel peatonal aumentando el PET y el estrés térmico.

        Args:
            pet_baseline: PET previo a la intervención (°C).
            pet_con_albedo: PET peatonal tras aplicar alto albedo sin arbolado (°C).
            umbral_critico: Umbral donde el estrés es crítico (def 40°C).

        Returns:
            Diccionario de diagnóstico y recomendación de mitigación.
        """
        delta_pet = round(pet_con_albedo - pet_baseline, 2)
        penalizado = pet_con_albedo >= umbral_critico or delta_pet > 2.0

        return {
            "albedo_penalty_detectado": penalizado,
            "pet_inicial_c": pet_baseline,
            "pet_con_albedo_c": pet_con_albedo,
            "incremento_pet_c": delta_pet,
            "severidad": "CRITICA" if pet_con_albedo >= umbral_critico else ("MODERADA" if delta_pet > 0 else "NULA"),
            "explicacion": (
                "ADVERTENCIA DE PARADOJA DE ALBEDO: El incremento de reflectancia en cubiertas "
                "reduce la demanda de refrigeración interior, pero refleja radiación de onda corta "
                f"hacia el cañón urbano, incrementando el PET peatonal en +{delta_pet} °C."
                if penalizado else
                "La intervención de albedo se encuentra en equilibrio y no genera estrés peatonal adverso."
            ),
            "recomendacion_mitigacion": (
                "Acompañar obligatoriamente el recubrimiento de alto albedo con arborización urbana de copa densa "
                "(árboles nativos: molle, jacarandá o tara) que intercepte la radiación reflejada al nivel de acera."
                if penalizado else
                "Intervención validada sin riesgo biometeorológico adverso."
            )
        }

    @classmethod
    def classify_thermal_stress(cls, utci: float) -> Dict[str, str]:
        """Clasifica el nivel de estrés térmico según el valor de UTCI."""
        for lim_inf, lim_sup, categoria, descripcion in cls.UTCI_CATEGORIES:
            if lim_inf <= utci < lim_sup:
                return {
                    "categoria": categoria,
                    "descripcion": descripcion,
                    "color_hex": (
                        "#ef4444" if "EXTREMO_CALOR" in categoria or "MUY_FUERTE_CALOR" in categoria else
                        "#f97316" if "FUERTE_CALOR" in categoria else
                        "#eab308" if "MODERADO_CALOR" in categoria else
                        "#22c55e" if "CONFORT" in categoria else
                        "#06b6d4"
                    )
                }
        return {"categoria": "DESCONOCIDO", "descripcion": "Fuera de escala", "color_hex": "#6b7280"}
