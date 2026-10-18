import json
import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.simulation import (
    SimulationScenario,
    ScenarioSnapshot,
    SimulationRun,
    SimulationStateStep,
    SimulationRunEvent,
)
from app.schemas.simulation import (
    SimulationScenarioCreate,
    SimulationScenarioResponse,
    SimulationRunResponse,
    SimulationResultsResponse,
    SimulationRunEventResponse,
    SimulationStateStepResponse,
    ScenarioSnapshotResponse,
)
from app.simulation.snapshot_service import create_scenario_snapshot, load_snapshot_data
from app.simulation.engine import SimulationEngine

logger = logging.getLogger("airops.routers.simulations")

router = APIRouter(prefix="/simulations", tags=["Simulation Engine"])


def _generate_scenario_code(db: Session) -> str:
    count = db.query(SimulationScenario).count() + 1
    return f"SCEN-{count:03d}"


def _generate_run_code(scenario_code: str, db: Session) -> str:
    count = db.query(SimulationRun).count() + 1
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"RUN-{scenario_code}-{date_str}-{count:03d}"


@router.post("", response_model=SimulationScenarioResponse, status_code=status.HTTP_201_CREATED)
def create_scenario(payload: SimulationScenarioCreate, db: Session = Depends(get_db)):
    """
    Create a new simulation scenario.
    Captures an immutable, isolated snapshot of current operational records
    (resources, missions, weather) so simulation runs never touch live data.
    """
    code = payload.scenario_code or _generate_scenario_code(db)

    # Check for duplicate code
    existing = db.query(SimulationScenario).filter(SimulationScenario.scenario_code == code).first()
    if existing:
        code = f"{code}-{int(datetime.now(timezone.utc).timestamp())}"

    events_json = json.dumps([e.model_dump() for e in payload.events_config]) if payload.events_config else "[]"

    scenario = SimulationScenario(
        scenario_code=code,
        name=payload.name,
        description=payload.description,
        duration_minutes=payload.duration_minutes,
        time_step_minutes=payload.time_step_minutes,
        random_seed=payload.random_seed,
        engine_version="1.0.0-discrete",
        status="READY",
        events_config=events_json,
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    # 2. Capture immutable snapshot
    create_scenario_snapshot(db, scenario.id, snapshot_version=f"v{scenario.scenario_code}-1.0")

    # 3. Create initial pending run
    run = SimulationRun(
        run_code=_generate_run_code(scenario.scenario_code, db),
        scenario_id=scenario.id,
        status="PENDING",
        current_virtual_time_minutes=0,
        total_virtual_duration_minutes=scenario.duration_minutes,
        time_step_minutes=scenario.time_step_minutes,
    )
    db.add(run)
    db.commit()
    db.refresh(scenario)

    return _build_scenario_response(scenario)


@router.get("", response_model=List[SimulationScenarioResponse])
def list_scenarios(db: Session = Depends(get_db)):
    """
    List all accessible simulation scenarios with their latest run status and snapshot metadata.
    """
    scenarios = db.query(SimulationScenario).order_by(SimulationScenario.created_at.desc()).all()
    return [_build_scenario_response(s) for s in scenarios]


@router.get("/{scenario_id}", response_model=SimulationScenarioResponse)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    """
    Get details of a specific scenario, including snapshot metadata and latest run status.
    """
    scenario = db.query(SimulationScenario).filter(SimulationScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")
    return _build_scenario_response(scenario)


@router.post("/{scenario_id}/run", response_model=SimulationRunResponse)
def run_simulation(scenario_id: int, db: Session = Depends(get_db)):
    """
    Execute simulation scenario to completion.
    Operates strictly in-memory against the immutable snapshot with deterministic random seed.
    """
    scenario = db.query(SimulationScenario).filter(SimulationScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")

    # Get or create active run
    run = db.query(SimulationRun).filter(
        SimulationRun.scenario_id == scenario.id,
        SimulationRun.status.in_(["PENDING", "PAUSED", "RESET"])
    ).order_by(SimulationRun.id.desc()).first()

    if not run:
        run = SimulationRun(
            run_code=_generate_run_code(scenario.scenario_code, db),
            scenario_id=scenario.id,
            status="PENDING",
            current_virtual_time_minutes=0,
            total_virtual_duration_minutes=scenario.duration_minutes,
            time_step_minutes=scenario.time_step_minutes,
        )
        db.add(run)
        db.commit()
        db.refresh(run)

    # Execute simulation engine
    engine = SimulationEngine(db, scenario, run)
    completed_run = engine.run_all()

    return SimulationRunResponse.model_validate(completed_run)


@router.post("/{scenario_id}/pause", response_model=SimulationRunResponse)
def pause_simulation(scenario_id: int, db: Session = Depends(get_db)):
    """
    Pause a running simulation.
    """
    run = db.query(SimulationRun).filter(
        SimulationRun.scenario_id == scenario_id,
        SimulationRun.status == "RUNNING"
    ).order_by(SimulationRun.id.desc()).first()

    if not run:
        # Check latest run
        run = db.query(SimulationRun).filter(SimulationRun.scenario_id == scenario_id).order_by(SimulationRun.id.desc()).first()
        if not run:
            raise HTTPException(status_code=404, detail="No active run found for this scenario")

    run.status = "PAUSED"
    db.commit()
    db.refresh(run)
    return SimulationRunResponse.model_validate(run)


@router.post("/{scenario_id}/resume", response_model=SimulationRunResponse)
def resume_simulation(scenario_id: int, db: Session = Depends(get_db)):
    """
    Resume a paused simulation run.
    """
    scenario = db.query(SimulationScenario).filter(SimulationScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")

    run = db.query(SimulationRun).filter(
        SimulationRun.scenario_id == scenario_id,
        SimulationRun.status == "PAUSED"
    ).order_by(SimulationRun.id.desc()).first()

    if not run:
        raise HTTPException(status_code=400, detail="Scenario is not in PAUSED state")

    engine = SimulationEngine(db, scenario, run)
    completed_run = engine.run_all()
    return SimulationRunResponse.model_validate(completed_run)


@router.post("/{scenario_id}/reset", response_model=SimulationRunResponse)
def reset_simulation(scenario_id: int, db: Session = Depends(get_db)):
    """
    Reset simulated state back to T+00:00.
    Clears simulated run history while strictly preserving live database records.
    """
    scenario = db.query(SimulationScenario).filter(SimulationScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")

    run = db.query(SimulationRun).filter(SimulationRun.scenario_id == scenario.id).order_by(SimulationRun.id.desc()).first()
    if not run:
        raise HTTPException(status_code=404, detail="No simulation run to reset")

    engine = SimulationEngine(db, scenario, run)
    reset_run = engine.reset()
    return SimulationRunResponse.model_validate(reset_run)


@router.get("/{scenario_id}/results", response_model=SimulationResultsResponse)
def get_simulation_results(scenario_id: int, db: Session = Depends(get_db)):
    """
    Retrieve comprehensive simulation results:
    - Calculated metrics & baseline comparison
    - Virtual time-series state progression for charting
    - Event audit history
    - Simulated resource and mission states
    """
    scenario = db.query(SimulationScenario).filter(SimulationScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")

    run = db.query(SimulationRun).filter(SimulationRun.scenario_id == scenario.id).order_by(SimulationRun.id.desc()).first()
    if not run:
        raise HTTPException(status_code=404, detail="No run records found for this scenario")

    # Time-series steps
    steps = db.query(SimulationStateStep).filter(SimulationStateStep.run_id == run.id).order_by(SimulationStateStep.virtual_time_minutes).all()
    events = db.query(SimulationRunEvent).filter(SimulationRunEvent.run_id == run.id).order_by(SimulationRunEvent.virtual_time_minutes).all()

    # Unpack metrics
    metrics_data = {}
    try:
        metrics_data = json.loads(run.metrics_summary) if run.metrics_summary else {}
    except Exception:
        pass

    # Unpack latest step details for simulated assets
    sim_resources = []
    sim_missions = []
    if steps:
        last_step = steps[-1]
        try:
            details = json.loads(last_step.step_details)
            sim_resources = details.get("resources_snapshot", [])
            sim_missions = details.get("missions_snapshot", [])
        except Exception:
            pass

    return SimulationResultsResponse(
        scenario_id=scenario.id,
        run_id=run.id,
        run_code=run.run_code,
        status=run.status,
        execution_duration_ms=run.execution_duration_ms,
        current_virtual_time_minutes=run.current_virtual_time_minutes,
        total_virtual_duration_minutes=run.total_virtual_duration_minutes,
        metrics=metrics_data.get("simulated", {}),
        baseline_vs_scenario=metrics_data.get("delta", {}),
        time_series=[SimulationStateStepResponse.model_validate(s) for s in steps],
        event_history=[SimulationRunEventResponse.model_validate(e) for e in events],
        simulated_resources=sim_resources,
        simulated_missions=sim_missions,
    )


@router.get("/{scenario_id}/events", response_model=List[SimulationRunEventResponse])
def get_simulation_run_events(scenario_id: int, db: Session = Depends(get_db)):
    """
    Retrieve event execution history for the latest run of a scenario.
    """
    run = db.query(SimulationRun).filter(SimulationRun.scenario_id == scenario_id).order_by(SimulationRun.id.desc()).first()
    if not run:
        return []
    events = db.query(SimulationRunEvent).filter(SimulationRunEvent.run_id == run.id).order_by(SimulationRunEvent.virtual_time_minutes).all()
    return [SimulationRunEventResponse.model_validate(e) for e in events]


def _build_scenario_response(s: SimulationScenario) -> SimulationScenarioResponse:
    latest_run = s.runs[0] if s.runs else None
    return SimulationScenarioResponse(
        id=s.id,
        scenario_code=s.scenario_code,
        name=s.name,
        description=s.description,
        duration_minutes=s.duration_minutes,
        time_step_minutes=s.time_step_minutes,
        random_seed=s.random_seed,
        engine_version=s.engine_version,
        status=s.status,
        events_config=s.events_config,
        created_at=s.created_at,
        updated_at=s.updated_at,
        snapshot=ScenarioSnapshotResponse.model_validate(s.snapshot) if s.snapshot else None,
        latest_run=SimulationRunResponse.model_validate(latest_run) if latest_run else None,
    )
