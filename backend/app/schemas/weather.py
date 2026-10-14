from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class WeatherZoneBase(BaseModel):
    zone_code: str
    zone_name: str
    condition: str
    risk_level: str
    temperature_c: float
    wind_speed_kmh: float
    visibility_km: float
    radar_status: str
    flight_advisory: str


class WeatherZoneCreate(WeatherZoneBase):
    pass


class WeatherZoneResponse(WeatherZoneBase):
    id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class WeatherAlertBase(BaseModel):
    alert_code: str
    timestamp_utc: str
    zone_code: str
    condition: str
    severity: str
    impact: str
    is_active: bool = True


class WeatherAlertCreate(WeatherAlertBase):
    pass


class WeatherAlertResponse(WeatherAlertBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class WeatherConditionCard(BaseModel):
    id: str
    title: str
    risk_level: str  # HIGH, MEDIUM, LOW
    badge: str
    icon_type: str
    bullet_points: List[str]


class WeatherImpactSummary(BaseModel):
    affected_missions: int
    total_missions: int
    delayed_missions: int
    rerouted_missions: int
    cancelled_missions: int


class WeatherScenarioResponse(BaseModel):
    scenario_id: str
    title: str
    description: str
    is_active: bool


class WeatherOverviewResponse(BaseModel):
    high_alert_zones: int
    medium_alert_zones: int
    low_alert_zones: int
    total_monitored_zones: int
    overall_status: str
    overall_description: str
    banner_message: Optional[str] = None
    banner_zone: Optional[str] = None
    zones: List[WeatherZoneResponse]
    conditions: List[WeatherConditionCard]
    recent_alerts: List[WeatherAlertResponse]
    impact: WeatherImpactSummary
    active_scenario: str
