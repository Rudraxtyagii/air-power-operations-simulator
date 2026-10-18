from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.weather import WeatherZone, WeatherAlert
from app.schemas.weather import (
    WeatherOverviewResponse,
    WeatherZoneResponse,
    WeatherAlertResponse,
    WeatherConditionCard,
    WeatherImpactSummary,
    LiveIndiaWeatherResponse,
)
from app.services.weather_data import (
    get_weather_overview,
    CONDITION_CARDS,
    SCENARIOS,
    INITIAL_ZONES,
    seed_weather_data_if_empty,
)
from app.services.live_weather_service import fetch_live_india_weather

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/overview", response_model=WeatherOverviewResponse)
def get_overview(db: Session = Depends(get_db)):
    """Return full weather monitoring overview matching the mockup dashboard"""
    return get_weather_overview(db)


@router.get("/zones", response_model=List[WeatherZoneResponse])
def get_zones(db: Session = Depends(get_db)):
    """Get all 9 monitored weather zones (Zone A to Zone I)"""
    seed_weather_data_if_empty(db)
    return db.query(WeatherZone).all()


@router.get("/zones/{zone_code}", response_model=WeatherZoneResponse)
def get_zone_by_code(zone_code: str, db: Session = Depends(get_db)):
    """Get specific weather zone details"""
    zone = db.query(WeatherZone).filter(WeatherZone.zone_code == zone_code.upper()).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone {zone_code} not found")
    return zone


@router.get("/conditions", response_model=List[WeatherConditionCard])
def get_conditions():
    """Get the 6 operational weather condition cards"""
    return CONDITION_CARDS


@router.get("/alerts", response_model=List[WeatherAlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    """Get recent weather alerts"""
    seed_weather_data_if_empty(db)
    return db.query(WeatherAlert).order_by(WeatherAlert.id.desc()).limit(20).all()


@router.get("/scenarios")
def get_scenarios():
    """List available simulated weather scenarios"""
    return [
        {
            "scenario_id": s["scenario_id"],
            "title": s["title"],
            "description": s["description"]
        }
        for s in SCENARIOS
    ]


@router.post("/scenarios/{scenario_id}/apply", response_model=WeatherOverviewResponse)
def apply_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Inject a simulated weather scenario across zones"""
    seed_weather_data_if_empty(db)
    target = next((s for s in SCENARIOS if s["scenario_id"] == scenario_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    # Apply updates
    updates: Dict[str, Any] = target.get("zone_updates", {})
    for zone_code, vals in updates.items():
        z = db.query(WeatherZone).filter(WeatherZone.zone_code == zone_code).first()
        if z:
            for k, v in vals.items():
                setattr(z, k, v)

    # Insert an alert record for high severity
    if target.get("banner_zone"):
        new_alert = WeatherAlert(
            alert_code=f"W-ALT-{int(db.query(WeatherAlert).count()) + 101}",
            timestamp_utc="Just Now",
            zone_code=target["banner_zone"],
            condition=target["title"],
            severity="HIGH",
            impact=target.get("banner_message", "Flight operations impacted"),
            is_active=True
        )
        db.add(new_alert)

    db.commit()
    return get_weather_overview(db)


@router.post("/reset", response_model=WeatherOverviewResponse)
def reset_weather(db: Session = Depends(get_db)):
    """Reset all zones to initial mock state"""
    db.query(WeatherZone).delete()
    for z in INITIAL_ZONES:
        db.add(WeatherZone(**z))
    db.commit()
    return get_weather_overview(db)


@router.get("/impact", response_model=WeatherImpactSummary)
def get_impact(db: Session = Depends(get_db)):
    """Get mission impact summary based on current zone risk levels"""
    overview = get_weather_overview(db)
    return overview.impact


@router.get("/live-india", response_model=LiveIndiaWeatherResponse)
async def get_live_india_weather(force: bool = False):
    """
    Fetch actual live meteorological readings for all 36 Indian States and UTs
    from the Open-Meteo Forecast API with server-side caching (10 min TTL) and documented risk scoring.
    """
    return await fetch_live_india_weather(force_refresh=force)


@router.post("/live-india/refresh", response_model=LiveIndiaWeatherResponse)
async def refresh_live_india_weather():
    """
    Force an immediate live update from the Open-Meteo Forecast API.
    """
    return await fetch_live_india_weather(force_refresh=True)

