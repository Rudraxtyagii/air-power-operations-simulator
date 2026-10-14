from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.simulation_event import SimulationEvent
from app.models.resource import Resource
from app.models.mission import Mission
from app.schemas.simulation_event import SimulationEventCreate, SimulationEventResponse

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.get("/events", response_model=List[SimulationEventResponse])
def get_simulation_events(db: Session = Depends(get_db)):
    events = db.query(SimulationEvent).order_by(SimulationEvent.created_at.desc()).all()
    results = []
    for e in events:
        resp = SimulationEventResponse.model_validate(e)
        resp.affected_resource_code = e.resource.resource_code if e.resource else None
        resp.affected_mission_code = e.mission.mission_code if e.mission else None
        results.append(resp)
    return results


@router.post("/events", response_model=SimulationEventResponse, status_code=status.HTTP_201_CREATED)
def create_simulation_event(event_in: SimulationEventCreate, db: Session = Depends(get_db)):
    event = SimulationEvent(**event_in.model_dump())
    db.add(event)

    # If the disruption targets a resource, update its status accordingly
    if event_in.affected_resource_id:
        res = db.query(Resource).filter(Resource.id == event_in.affected_resource_id).first()
        if res:
            if "UNAVAILABLE" in event_in.event_type.upper():
                res.availability_status = "UNAVAILABLE"
            elif "MAINTENANCE" in event_in.event_type.upper():
                res.availability_status = "MAINTENANCE"
                res.maintenance_status = "MAINTENANCE"

    # If the disruption targets a mission, update its status accordingly
    if event_in.affected_mission_id:
        mis = db.query(Mission).filter(Mission.id == event_in.affected_mission_id).first()
        if mis:
            if "DELAY" in event_in.event_type.upper():
                mis.status = "DELAYED"
            elif "CANCEL" in event_in.event_type.upper():
                mis.status = "PENDING"

    db.commit()
    db.refresh(event)

    resp = SimulationEventResponse.model_validate(event)
    resp.affected_resource_code = event.resource.resource_code if event.resource else None
    resp.affected_mission_code = event.mission.mission_code if event.mission else None
    return resp
