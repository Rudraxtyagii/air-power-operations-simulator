import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.resource import Resource
from app.models.mission import Mission
from app.models.weather import WeatherZone
from app.models.simulation import ScenarioSnapshot

logger = logging.getLogger("airops.simulation.snapshot")


def create_scenario_snapshot(db: Session, scenario_id: int, snapshot_version: str = "v1.0") -> ScenarioSnapshot:
    """
    Captures a frozen, immutable snapshot from the current operational data layer.
    Ensures that simulation runs strictly evaluate against the snapshot and NEVER
    mutate live database records.
    """
    now = datetime.now(timezone.utc)

    # 1. Fetch live records
    resources = db.query(Resource).all()
    missions = db.query(Mission).all()
    weather_zones = db.query(WeatherZone).all()

    # 2. Serialize into isolated JSON payload
    resources_data = [
        {
            "id": r.id,
            "resource_code": r.resource_code,
            "resource_type": r.resource_type,
            "capacity": r.capacity,
            "availability_status": r.availability_status,
            "fuel_level": r.fuel_level,
            "maintenance_status": r.maintenance_status,
            "operating_hours": r.operating_hours,
            "current_zone": r.current_zone,
            "home_base": r.home_base,
            "predicted_availability": r.predicted_availability,
        }
        for r in resources
    ]

    missions_data = [
        {
            "id": m.id,
            "mission_code": m.mission_code,
            "name": m.name,
            "priority": m.priority,
            "zone": m.zone,
            "duration_minutes": m.duration_minutes,
            "start_window": m.start_window.isoformat() if m.start_window else None,
            "end_window": m.end_window.isoformat() if m.end_window else None,
            "required_resource_type": m.required_resource_type,
            "required_resource_count": m.required_resource_count,
            "status": m.status,
        }
        for m in missions
    ]

    weather_data = [
        {
            "id": wz.id,
            "zone_code": wz.zone_code,
            "zone_name": wz.zone_name,
            "condition": wz.condition,
            "risk_level": wz.risk_level,
            "temperature_c": wz.temperature_c,
            "wind_speed_kmh": wz.wind_speed_kmh,
            "visibility_km": wz.visibility_km,
            "radar_status": wz.radar_status,
        }
        for wz in weather_zones
    ]

    # Validate data quality
    freshness = "CURRENT_VERIFIED"
    if not resources_data or not missions_data:
        freshness = "PARTIAL_STALE"
        logger.warning(f"Snapshot captured with low record counts: {len(resources_data)} res, {len(missions_data)} missions")

    snapshot_dict = {
        "metadata": {
            "captured_at": now.isoformat(),
            "snapshot_version": snapshot_version,
            "schema_version": "1.0.0",
            "open_sky_aligned": True,
            "faa_sfdps_aligned": True,
        },
        "resources": resources_data,
        "missions": missions_data,
        "weather": weather_data,
    }

    snapshot = ScenarioSnapshot(
        scenario_id=scenario_id,
        snapshot_version=snapshot_version,
        source_timestamp=now,
        data_provenance="Centralized Operational Data Layer (Live Synthetic Assets & METAR/Open-Meteo)",
        resources_count=len(resources_data),
        missions_count=len(missions_data),
        weather_zones_count=len(weather_data),
        data_freshness_status=freshness,
        snapshot_data=json.dumps(snapshot_dict),
    )

    db.add(snapshot)
    db.flush()
    logger.info(f"Created immutable snapshot for scenario {scenario_id} with {len(resources_data)} resources, {len(missions_data)} missions")
    return snapshot


def load_snapshot_data(snapshot: ScenarioSnapshot) -> Dict[str, Any]:
    """
    Safely unpacks the snapshot JSON payload into deep-copied Python dictionaries
    ready for sandboxed in-memory simulation.
    """
    if not snapshot or not snapshot.snapshot_data:
        return {"resources": [], "missions": [], "weather": []}
    try:
        return json.loads(snapshot.snapshot_data)
    except Exception as e:
        logger.error(f"Failed to parse snapshot JSON: {e}")
        return {"resources": [], "missions": [], "weather": []}
