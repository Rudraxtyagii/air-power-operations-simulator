from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleResponse

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.get("", response_model=List[ScheduleResponse])
def get_schedules(db: Session = Depends(get_db)):
    schedules = db.query(Schedule).order_by(Schedule.start_time.asc()).all()
    results = []
    for s in schedules:
        resp = ScheduleResponse.model_validate(s)
        resp.mission_code = s.mission.mission_code if s.mission else None
        resp.resource_code = s.resource.resource_code if s.resource else None
        results.append(resp)
    return results


@router.get("/{id}", response_model=ScheduleResponse)
def get_schedule(id: int, db: Session = Depends(get_db)):
    s = db.query(Schedule).filter(Schedule.id == id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Schedule with id {id} not found")
    resp = ScheduleResponse.model_validate(s)
    resp.mission_code = s.mission.mission_code if s.mission else None
    resp.resource_code = s.resource.resource_code if s.resource else None
    return resp
