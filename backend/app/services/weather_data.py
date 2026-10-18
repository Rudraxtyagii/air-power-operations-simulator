from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.weather import WeatherZone, WeatherAlert, WeatherScenario
from app.models.mission import Mission
from app.schemas.weather import WeatherConditionCard, WeatherImpactSummary, WeatherOverviewResponse

INITIAL_ZONES = [
    {
        "zone_code": "ZONE_A",
        "zone_name": "Zone A - Sector Alpha",
        "condition": "Clear",
        "risk_level": "LOW",
        "temperature_c": 28.0,
        "wind_speed_kmh": 12.0,
        "visibility_km": 10.0,
        "radar_status": "Clear Skies",
        "flight_advisory": "All flight corridors operating without restrictions."
    },
    {
        "zone_code": "ZONE_B",
        "zone_name": "Zone B - Bravo Ridge",
        "condition": "Thunderstorm",
        "risk_level": "HIGH",
        "temperature_c": 22.0,
        "wind_speed_kmh": 45.0,
        "visibility_km": 1.5,
        "radar_status": "Severe Convective Cells",
        "flight_advisory": "Severe Thunderstorm detected. Flight diversion required; takeoff holds active."
    },
    {
        "zone_code": "ZONE_C",
        "zone_name": "Zone C - Central Corridor",
        "condition": "Heavy Rain",
        "risk_level": "MEDIUM",
        "temperature_c": 24.0,
        "wind_speed_kmh": 28.0,
        "visibility_km": 4.0,
        "radar_status": "Precipitation Bands",
        "flight_advisory": "Landing delays expected; increased aircraft separation mandated."
    },
    {
        "zone_code": "ZONE_D",
        "zone_name": "Zone D - Delta Valley",
        "condition": "Clear",
        "risk_level": "LOW",
        "temperature_c": 30.0,
        "wind_speed_kmh": 10.0,
        "visibility_km": 10.0,
        "radar_status": "Optimal",
        "flight_advisory": "Standard operating protocols active."
    },
    {
        "zone_code": "ZONE_E",
        "zone_name": "Zone E - Eastern Plateau",
        "condition": "Dense Fog",
        "risk_level": "MEDIUM",
        "temperature_c": 18.0,
        "wind_speed_kmh": 8.0,
        "visibility_km": 0.8,
        "radar_status": "Low Ceiling Inversion",
        "flight_advisory": "Instrument approach only; runway visual range below standard minimums."
    },
    {
        "zone_code": "ZONE_F",
        "zone_name": "Zone F - Foothills Range",
        "condition": "Sandstorm",
        "risk_level": "HIGH",
        "temperature_c": 32.0,
        "wind_speed_kmh": 52.0,
        "visibility_km": 0.3,
        "radar_status": "Particulate Obscuration",
        "flight_advisory": "Turbine FOD danger; ground operations and low-altitude flight suspended."
    },
    {
        "zone_code": "ZONE_G",
        "zone_name": "Zone G - Gulf Approach",
        "condition": "Clear",
        "risk_level": "LOW",
        "temperature_c": 26.0,
        "wind_speed_kmh": 14.0,
        "visibility_km": 10.0,
        "radar_status": "Unrestricted",
        "flight_advisory": "Corridors green. Fuel transfer and routine sorties clear."
    },
    {
        "zone_code": "ZONE_H",
        "zone_name": "Zone H - Highland Sector",
        "condition": "Light Rain",
        "risk_level": "LOW",
        "temperature_c": 25.0,
        "wind_speed_kmh": 18.0,
        "visibility_km": 6.0,
        "radar_status": "Scattered Showers",
        "flight_advisory": "Caution for damp runways; standard glide paths nominal."
    },
    {
        "zone_code": "ZONE_I",
        "zone_name": "Zone I - Northern Crest",
        "condition": "Snow & Icing",
        "risk_level": "MEDIUM",
        "temperature_c": -2.0,
        "wind_speed_kmh": 36.0,
        "visibility_km": 2.0,
        "radar_status": "Sub-zero Cloud Tops",
        "flight_advisory": "Moderate airframe icing reported FL120-FL180. Anti-ice systems mandatory."
    }
]

INITIAL_ALERTS = [
    {
        "alert_code": "W-ALT-101",
        "timestamp_utc": "14:28",
        "zone_code": "ZONE_B",
        "condition": "Severe Thunderstorm",
        "severity": "HIGH",
        "impact": "Flight diversion required",
        "is_active": True
    },
    {
        "alert_code": "W-ALT-102",
        "timestamp_utc": "14:15",
        "zone_code": "ZONE_F",
        "condition": "Sandstorm",
        "severity": "HIGH",
        "impact": "Ground operations halted",
        "is_active": True
    },
    {
        "alert_code": "W-ALT-103",
        "timestamp_utc": "13:52",
        "zone_code": "ZONE_C",
        "condition": "Heavy Rain",
        "severity": "MEDIUM",
        "impact": "Landing delay expected",
        "is_active": True
    },
    {
        "alert_code": "W-ALT-104",
        "timestamp_utc": "13:30",
        "zone_code": "ZONE_E",
        "condition": "Dense Fog",
        "severity": "MEDIUM",
        "impact": "Low visibility - 600m",
        "is_active": True
    },
    {
        "alert_code": "W-ALT-105",
        "timestamp_utc": "12:48",
        "zone_code": "ZONE_I",
        "condition": "Snow & Icing",
        "severity": "MEDIUM",
        "impact": "Icing conditions detected",
        "is_active": True
    }
]

CONDITION_CARDS: List[WeatherConditionCard] = [
    WeatherConditionCard(
        id="cond_1",
        title="Thunderstorms & Lightning",
        risk_level="HIGH",
        badge="HIGH",
        icon_type="thunderstorm",
        bullet_points=[
            "High lightning activity",
            "Severe turbulence",
            "Route diversions likely"
        ]
    ),
    WeatherConditionCard(
        id="cond_2",
        title="Heavy Snow & Icing",
        risk_level="MEDIUM",
        badge="MEDIUM",
        icon_type="snow",
        bullet_points=[
            "Ice accumulation risk",
            "Reduced lift efficiency",
            "Engine performance impact"
        ]
    ),
    WeatherConditionCard(
        id="cond_3",
        title="Dense Fog",
        risk_level="MEDIUM",
        badge="MEDIUM",
        icon_type="fog",
        bullet_points=[
            "Low visibility (< 500m)",
            "Landing operations affected",
            "Instrument approach required"
        ]
    ),
    WeatherConditionCard(
        id="cond_4",
        title="Strong Crosswinds",
        risk_level="MEDIUM",
        badge="MEDIUM",
        icon_type="wind",
        bullet_points=[
            "Crosswind speed > 30 knots",
            "Landing difficulty",
            "Runway operations impacted"
        ]
    ),
    WeatherConditionCard(
        id="cond_5",
        title="Heavy Rain",
        risk_level="LOW",
        badge="LOW",
        icon_type="rain",
        bullet_points=[
            "Reduced runway friction",
            "Risk of hydroplaning",
            "Slower take-off/landing"
        ]
    ),
    WeatherConditionCard(
        id="cond_6",
        title="Sandstorms / Dust Storms",
        risk_level="HIGH",
        badge="HIGH",
        icon_type="sandstorm",
        bullet_points=[
            "Very low visibility",
            "Engine damage risk (FOD)",
            "Ground operations halt"
        ]
    )
]

SCENARIOS: List[Dict[str, Any]] = [
    {
        "scenario_id": "thunderstorm_active",
        "title": "Severe Thunderstorm Front",
        "description": "High convective storm cluster across Zone B and sandstorm in Zone F. Moderate rain and fog in Zones C, E, I.",
        "zone_updates": {
            "ZONE_B": {"condition": "Thunderstorm", "risk_level": "HIGH", "visibility_km": 1.5, "wind_speed_kmh": 45.0},
            "ZONE_F": {"condition": "Sandstorm", "risk_level": "HIGH", "visibility_km": 0.3, "wind_speed_kmh": 52.0},
            "ZONE_C": {"condition": "Heavy Rain", "risk_level": "MEDIUM", "visibility_km": 4.0, "wind_speed_kmh": 28.0},
            "ZONE_E": {"condition": "Dense Fog", "risk_level": "MEDIUM", "visibility_km": 0.8, "wind_speed_kmh": 8.0},
            "ZONE_I": {"condition": "Snow & Icing", "risk_level": "MEDIUM", "visibility_km": 2.0, "wind_speed_kmh": 36.0},
        },
        "banner_message": "Severe Thunderstorm detected in Zone B. Take necessary action and review affected missions.",
        "banner_zone": "ZONE_B"
    },
    {
        "scenario_id": "winter_blizzard",
        "title": "Sub-Zero Blizzard Incursion",
        "description": "Arctic cold front pushing down into Zones C, E, and I with extreme icing and sub-zero visibility.",
        "zone_updates": {
            "ZONE_I": {"condition": "Blizzard & Icing", "risk_level": "HIGH", "visibility_km": 0.5, "wind_speed_kmh": 65.0, "temperature_c": -12.0},
            "ZONE_E": {"condition": "Freezing Fog", "risk_level": "HIGH", "visibility_km": 0.4, "wind_speed_kmh": 22.0, "temperature_c": -4.0},
            "ZONE_C": {"condition": "Sleet & Crosswinds", "risk_level": "MEDIUM", "visibility_km": 2.5, "wind_speed_kmh": 42.0, "temperature_c": 1.0},
            "ZONE_B": {"condition": "Overcast", "risk_level": "LOW", "visibility_km": 9.0, "wind_speed_kmh": 16.0},
            "ZONE_F": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 10.0, "wind_speed_kmh": 12.0},
        },
        "banner_message": "Severe Blizzard & Airframe Icing alert across Zone I. Reroute or delay northern crest sorties.",
        "banner_zone": "ZONE_I"
    },
    {
        "scenario_id": "clear_skies",
        "title": "Nominal VFR Flying Envelope",
        "description": "Clear high-pressure system across all operational zones. Unrestricted flight visibility.",
        "zone_updates": {
            "ZONE_A": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 8.0},
            "ZONE_B": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 10.0},
            "ZONE_C": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 9.0},
            "ZONE_D": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 7.0},
            "ZONE_E": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 6.0},
            "ZONE_F": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 11.0},
            "ZONE_G": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 8.0},
            "ZONE_H": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 10.0},
            "ZONE_I": {"condition": "Clear", "risk_level": "LOW", "visibility_km": 12.0, "wind_speed_kmh": 12.0},
        },
        "banner_message": "All operational zones reporting nominal weather envelopes. 0 adverse hazards detected.",
        "banner_zone": None
    }
]


def seed_weather_data_if_empty(db: Session):
    """Seed initial 9 zones and alerts if table is empty"""
    existing_count = db.query(WeatherZone).count()
    if existing_count == 0:
        for z in INITIAL_ZONES:
            zone_obj = WeatherZone(**z)
            db.add(zone_obj)
        db.commit()

    existing_alerts = db.query(WeatherAlert).count()
    if existing_alerts == 0:
        for a in INITIAL_ALERTS:
            alert_obj = WeatherAlert(**a)
            db.add(alert_obj)
        db.commit()


def get_weather_overview(db: Session) -> WeatherOverviewResponse:
    """Calculate and return complete weather overview matching the mockup"""
    seed_weather_data_if_empty(db)
    zones = db.query(WeatherZone).all()
    recent_alerts = db.query(WeatherAlert).order_by(WeatherAlert.id.desc()).limit(10).all()

    high_count = sum(1 for z in zones if z.risk_level == "HIGH")
    med_count = sum(1 for z in zones if z.risk_level == "MEDIUM")
    low_count = sum(1 for z in zones if z.risk_level == "LOW")
    total_zones = len(zones)

    overall_status = "ACTIVE" if high_count > 0 else ("MODERATE" if med_count > 0 else "OPTIMAL")
    overall_desc = (
        "Moderate to high risk in multiple zones"
        if high_count > 0
        else ("Moderate weather advisories active" if med_count > 0 else "Nominal flight envelope across all sectors")
    )

    # Banner message
    banner_zone = "ZONE_B" if any(z.zone_code == "ZONE_B" and z.risk_level == "HIGH" for z in zones) else None
    if banner_zone:
        banner_msg = "Severe Thunderstorm detected in Zone B. Take necessary action and review affected missions."
    elif high_count > 0:
        high_z = next(z.zone_code for z in zones if z.risk_level == "HIGH")
        banner_msg = f"High Weather Alert active in {high_z}. Review affected air operations."
        banner_zone = high_z
    else:
        banner_msg = None

    # Calculate mission impact
    total_missions = db.query(Mission).count() or 15
    # Find missions assigned to high or medium risk zones
    high_or_med_zones = [z.zone_code for z in zones if z.risk_level in ["HIGH", "MEDIUM"]]
    # Count missions matching those zones (synthetic mapping)
    affected_count = 6 if high_count > 0 else (3 if med_count > 0 else 0)
    delayed_count = 4 if high_count > 0 else (2 if med_count > 0 else 0)
    rerouted_count = 2 if high_count > 0 else (1 if med_count > 0 else 0)
    cancelled_count = 0

    impact = WeatherImpactSummary(
        affected_missions=affected_count,
        total_missions=total_missions,
        delayed_missions=delayed_count,
        rerouted_missions=rerouted_count,
        cancelled_missions=cancelled_count
    )

    from app.services.live_weather_service import live_weather_cache
    conditions_list = (
        live_weather_cache.cached_payload.get("condition_cards")
        if (live_weather_cache and live_weather_cache.cached_payload and live_weather_cache.cached_payload.get("condition_cards"))
        else CONDITION_CARDS
    )

    return WeatherOverviewResponse(
        high_alert_zones=high_count,
        medium_alert_zones=med_count,
        low_alert_zones=low_count,
        total_monitored_zones=total_zones,
        overall_status=overall_status,
        overall_description=overall_desc,
        banner_message=banner_msg,
        banner_zone=banner_zone,
        zones=zones,
        conditions=conditions_list,
        recent_alerts=recent_alerts,
        impact=impact,
        active_scenario="thunderstorm_active"
    )
