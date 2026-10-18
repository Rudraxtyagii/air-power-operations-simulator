from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import Integer, String, Float, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class SimulationScenario(Base):
    """
    Scenario Definition Model.
    Represents a configured, repeatable simulation experiment with its parameters.
    """
    __tablename__ = "simulation_scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    scenario_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Engine & Execution Parameters
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=240)  # e.g., 4 hours
    time_step_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=15)   # 15 min steps
    random_seed: Mapped[int] = mapped_column(Integer, nullable=False, default=42)         # deterministic seed
    engine_version: Mapped[str] = mapped_column(String(50), nullable=False, default="1.0.0-discrete")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="READY")     # DRAFT, READY, RUNNING, COMPLETED, FAILED

    # Configured Fictional Events (JSON-serialized list of event injects)
    events_config: Mapped[str] = mapped_column(Text, nullable=False, default="[]")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    snapshot = relationship("ScenarioSnapshot", back_populates="scenario", uselist=False, cascade="all, delete-orphan")
    runs = relationship("SimulationRun", back_populates="scenario", cascade="all, delete-orphan", order_by="desc(SimulationRun.id)")


class ScenarioSnapshot(Base):
    """
    Immutable Input Snapshot Model.
    Captures a frozen copy of live records (Resources, Missions, Weather)
    ensuring strict data isolation from operational databases.
    """
    __tablename__ = "scenario_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    scenario_id: Mapped[int] = mapped_column(Integer, ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    snapshot_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1.0")
    source_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    data_provenance: Mapped[str] = mapped_column(String(255), nullable=False, default="Live Operational Data Layer")
    
    # Snapshot counts & validation status
    resources_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    missions_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    weather_zones_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data_freshness_status: Mapped[str] = mapped_column(String(50), nullable=False, default="VALID_CURRENT")

    # Frozen Data (JSON formatted)
    snapshot_data: Mapped[str] = mapped_column(Text, nullable=False)  # JSON: {resources: [...], missions: [...], weather: [...]}

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationship
    scenario = relationship("SimulationScenario", back_populates="snapshot")


class SimulationRun(Base):
    """
    Simulation Run Execution Record.
    Tracks state, metrics, and event log for a specific execution of a scenario.
    """
    __tablename__ = "simulation_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    run_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    scenario_id: Mapped[int] = mapped_column(Integer, ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), nullable=False)
    
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")  # PENDING, RUNNING, PAUSED, COMPLETED, RESET, FAILED
    
    current_virtual_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_virtual_duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=240)
    time_step_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    
    execution_duration_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    events_processed_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    validation_errors_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # JSON-encoded metrics summary
    metrics_summary: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    error_message: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    scenario = relationship("SimulationScenario", back_populates="runs")
    state_steps = relationship("SimulationStateStep", back_populates="run", cascade="all, delete-orphan", order_by="SimulationStateStep.virtual_time_minutes")
    run_events = relationship("SimulationRunEvent", back_populates="run", cascade="all, delete-orphan", order_by="SimulationRunEvent.virtual_time_minutes")


class SimulationStateStep(Base):
    """
    Time-Series State Point.
    Records system metrics at each discrete step of virtual time for visualization.
    """
    __tablename__ = "simulation_state_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id: Mapped[int] = mapped_column(Integer, ForeignKey("simulation_runs.id", ondelete="CASCADE"), nullable=False)
    
    virtual_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    virtual_time_label: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g. "T+00:00", "T+00:15"
    
    available_resources_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    in_mission_resources_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    maintenance_resources_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unavailable_resources_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    active_missions_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_missions_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    delayed_missions_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    fleet_availability_pct: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    average_delay_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    weather_risk_index: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    
    step_details: Mapped[str] = mapped_column(Text, nullable=False, default="{}")

    # Relationship
    run = relationship("SimulationRun", back_populates="state_steps")


class SimulationRunEvent(Base):
    """
    Executed Simulation Event Record.
    Records discrete events executed on the virtual timeline.
    """
    __tablename__ = "simulation_run_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id: Mapped[int] = mapped_column(Integer, ForeignKey("simulation_runs.id", ondelete="CASCADE"), nullable=False)
    
    virtual_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM")
    target_code: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    applied_effect: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationship
    run = relationship("SimulationRun", back_populates="run_events")
