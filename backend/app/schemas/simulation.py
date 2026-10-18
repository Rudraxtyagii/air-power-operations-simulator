from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class SimulationEventConfig(BaseModel):
    virtual_time_minutes: int = Field(..., ge=0, description="Virtual minute from start when event fires (e.g. 30)")
    event_type: str = Field(..., description="RESOURCE_UNAVAILABLE, WEATHER_HAZARD, TRAJECTORY_DELAY, MAINTENANCE_SURGE, CAPACITY_REDUCED")
    target_code: str = Field(..., description="Target asset or zone code, e.g. A02, ZONE_B, M004")
    severity: str = Field("HIGH", description="LOW, MEDIUM, HIGH, CRITICAL")
    description: str = Field(..., description="Human-readable event narrative")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom event parameters")


class SimulationScenarioBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)
    duration_minutes: int = Field(240, ge=15, le=1440, description="Total virtual duration in minutes (default 4 hours)")
    time_step_minutes: int = Field(15, ge=1, le=60, description="Virtual clock resolution per step in minutes")
    random_seed: int = Field(42, description="Configurable seed for deterministic stochastic runs")
    events_config: Optional[List[SimulationEventConfig]] = Field(default_factory=list)


class SimulationScenarioCreate(SimulationScenarioBase):
    scenario_code: Optional[str] = Field(None, max_length=50)


class SimulationScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    time_step_minutes: Optional[int] = None
    random_seed: Optional[int] = None
    events_config: Optional[List[SimulationEventConfig]] = None


class ScenarioSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    snapshot_version: str
    source_timestamp: datetime
    data_provenance: str
    resources_count: int
    missions_count: int
    weather_zones_count: int
    data_freshness_status: str
    created_at: datetime


class SimulationStateStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    virtual_time_minutes: int
    virtual_time_label: str
    available_resources_count: int
    in_mission_resources_count: int
    maintenance_resources_count: int
    unavailable_resources_count: int
    active_missions_count: int
    completed_missions_count: int
    delayed_missions_count: int
    fleet_availability_pct: float
    average_delay_minutes: float
    weather_risk_index: float


class SimulationRunEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    run_id: int
    virtual_time_minutes: int
    event_type: str
    severity: str
    target_code: str
    description: str
    applied_effect: str
    created_at: datetime


class SimulationRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    run_code: str
    scenario_id: int
    status: str
    current_virtual_time_minutes: int
    total_virtual_duration_minutes: int
    time_step_minutes: int
    execution_duration_ms: float
    events_processed_count: int
    validation_errors_count: int
    metrics_summary: str
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class SimulationScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_code: str
    name: str
    description: str
    duration_minutes: int
    time_step_minutes: int
    random_seed: int
    engine_version: str
    status: str
    events_config: str
    created_at: datetime
    updated_at: datetime
    snapshot: Optional[ScenarioSnapshotResponse] = None
    latest_run: Optional[SimulationRunResponse] = None


class SimulationRunControlRequest(BaseModel):
    action: str = Field(..., description="run, pause, resume, reset, step")


class SimulationResultsResponse(BaseModel):
    scenario_id: int
    run_id: int
    run_code: str
    status: str
    execution_duration_ms: float
    current_virtual_time_minutes: int
    total_virtual_duration_minutes: int
    metrics: Dict[str, Any]
    baseline_vs_scenario: Dict[str, Any]
    time_series: List[SimulationStateStepResponse]
    event_history: List[SimulationRunEventResponse]
    simulated_resources: List[Dict[str, Any]]
    simulated_missions: List[Dict[str, Any]]
