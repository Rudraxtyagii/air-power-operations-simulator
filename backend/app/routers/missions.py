from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.mission import Mission
from app.schemas.mission import MissionCreate, MissionUpdate, MissionResponse

router = APIRouter(prefix="/missions", tags=["Missions"])


@router.get("", response_model=List[MissionResponse])
def get_missions(
    search: Optional[str] = Query(None, description="Search by name, code or zone"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    query = db.query(Mission)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Mission.name.ilike(search_filter),
                Mission.mission_code.ilike(search_filter),
                Mission.zone.ilike(search_filter)
            )
        )

    if priority and priority.upper() != "ALL":
        query = query.filter(Mission.priority == priority.upper())

    if status and status.upper() != "ALL":
        query = query.filter(Mission.status == status.upper())

    return query.order_by(Mission.id.asc()).all()


@router.get("/{id}", response_model=MissionResponse)
def get_mission(id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == id).first()
    if not mission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Mission with id {id} not found")
    return mission


@router.post("", response_model=MissionResponse, status_code=status.HTTP_201_CREATED)
def create_mission(mission_in: MissionCreate, db: Session = Depends(get_db)):
    existing = db.query(Mission).filter(Mission.mission_code == mission_in.mission_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Mission code {mission_in.mission_code} already exists"
        )

    mission = Mission(**mission_in.model_dump())
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission


@router.put("/{id}", response_model=MissionResponse)
def update_mission(id: int, mission_update: MissionUpdate, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == id).first()
    if not mission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Mission with id {id} not found")

    update_data = mission_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mission, field, value)

    db.commit()
    db.refresh(mission)
    return mission


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mission(id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == id).first()
    if not mission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Mission with id {id} not found")

    db.delete(mission)
    db.commit()
    return None
