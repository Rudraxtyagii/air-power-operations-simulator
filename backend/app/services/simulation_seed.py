import json
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.simulation import SimulationScenario, SimulationRun
from app.simulation.snapshot_service import create_scenario_snapshot

logger = logging.getLogger("airops.simulation.seed")


def seed_simulation_scenarios_if_empty(db: Session):
    count = db.query(SimulationScenario).count()
    if count > 0:
        return

    logger.info("Seeding initial simulation scenarios...")

    # Scenario 1: Operational Surge & High-Tempo Fleet Stress
    scen1 = SimulationScenario(
        scenario_code="SCEN-001",
        name="Operational Surge & High-Tempo Fleet Stress",
        description="Evaluates fleet resilience under rapid sortie cycling, unexpected actuator faults (referencing OpenSky transponder telemetry), and convective weather closures.",
        duration_minutes=240,
        time_step_minutes=15,
        random_seed=42,
        engine_version="1.0.0-discrete",
        status="READY",
        events_config=json.dumps([
            {
                "virtual_time_minutes": 30,
                "event_type": "RESOURCE_UNAVAILABLE",
                "target_code": "A02",
                "severity": "HIGH",
                "description": "Aircraft A02 actuator calibration warning detected; asset grounded for inspection.",
                "parameters": {"subsystem": "hydraulic_actuator"}
            },
            {
                "virtual_time_minutes": 60,
                "event_type": "WEATHER_HAZARD",
                "target_code": "ZONE_B",
                "severity": "CRITICAL",
                "description": "Severe squall line and convective storm incursion closing Zone B airspace corridor.",
                "parameters": {"wind_speed_kmh": 65, "visibility_km": 2.0}
            },
            {
                "virtual_time_minutes": 120,
                "event_type": "TRAJECTORY_DELAY",
                "target_code": "M004",
                "severity": "MEDIUM",
                "description": "En-route airspace corridor rerouting delay (+30 mins) matching FAA SWIM SFDPS delay distribution.",
                "parameters": {"delay_minutes": 30}
            },
            {
                "virtual_time_minutes": 180,
                "event_type": "RESOURCE_MAINTENANCE",
                "target_code": "A06",
                "severity": "MEDIUM",
                "description": "Aircraft A06 operational flight hour threshold reached; scheduled phase inspection.",
                "parameters": {"inspection_type": "phase_a"}
            }
        ])
    )
    db.add(scen1)
    db.commit()
    db.refresh(scen1)
    create_scenario_snapshot(db, scen1.id, snapshot_version="vSCEN-001-1.0")

    run1 = SimulationRun(
        run_code=f"RUN-SCEN-001-{datetime.now(timezone.utc).strftime('%Y%m%d')}-001",
        scenario_id=scen1.id,
        status="PENDING",
        current_virtual_time_minutes=0,
        total_virtual_duration_minutes=240,
        time_step_minutes=15,
    )
    db.add(run1)

    # Scenario 2: Monsoon Front & Maritime Base Logistics Degradation
    scen2 = SimulationScenario(
        scenario_code="SCEN-002",
        name="Monsoon Front & Maritime Logistics Degradation",
        description="Simulates coastal heavy rainfall, reduced turnaround fuel throughput, and multi-sortie diversions.",
        duration_minutes=360,
        time_step_minutes=15,
        random_seed=101,
        engine_version="1.0.0-discrete",
        status="READY",
        events_config=json.dumps([
            {
                "virtual_time_minutes": 45,
                "event_type": "WEATHER_HAZARD",
                "target_code": "ZONE_C",
                "severity": "HIGH",
                "description": "Monsoon depression brings heavy rain and cloud ceiling below 500 ft in Zone C.",
                "parameters": {"ceiling_ft": 450}
            },
            {
                "virtual_time_minutes": 90,
                "event_type": "CAPACITY_REDUCED",
                "target_code": "BASE_2",
                "severity": "MEDIUM",
                "description": "Base-2 Fuel Depot throughput degraded (-40% refuel rate) due to pump maintenance.",
                "parameters": {"capacity_reduction_pct": 40}
            },
            {
                "virtual_time_minutes": 180,
                "event_type": "TRAJECTORY_DELAY",
                "target_code": "M001",
                "severity": "MEDIUM",
                "description": "Reconnaissance Alpha flight path diverted around squall front (+45 mins delay).",
                "parameters": {"delay_minutes": 45}
            }
        ])
    )
    db.add(scen2)
    db.commit()
    db.refresh(scen2)
    create_scenario_snapshot(db, scen2.id, snapshot_version="vSCEN-002-1.0")

    run2 = SimulationRun(
        run_code=f"RUN-SCEN-002-{datetime.now(timezone.utc).strftime('%Y%m%d')}-002",
        scenario_id=scen2.id,
        status="PENDING",
        current_virtual_time_minutes=0,
        total_virtual_duration_minutes=360,
        time_step_minutes=15,
    )
    db.add(run2)

    db.commit()
    logger.info("Successfully seeded 2 default simulation scenarios with isolated snapshots.")
