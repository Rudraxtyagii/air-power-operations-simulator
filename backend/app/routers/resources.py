from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=List[ResourceResponse])
def get_resources(
    search: Optional[str] = Query(None, description="Search by code, type, home base or zone"),
    type: Optional[str] = Query(None, description="Filter by resource type"),
    status: Optional[str] = Query(None, description="Filter by availability status"),
    db: Session = Depends(get_db)
):
    query = db.query(Resource)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Resource.resource_code.ilike(search_filter),
                Resource.resource_type.ilike(search_filter),
                Resource.home_base.ilike(search_filter),
                Resource.current_zone.ilike(search_filter)
            )
        )

    if type and type.upper() != "ALL":
        normalized_type = type.upper().replace("-", "_").replace(" ", "_")
        query = query.filter(Resource.resource_type == normalized_type)

    if status and status.upper() != "ALL":
        normalized_status = status.upper().replace(" ", "_").replace("-", "_")
        query = query.filter(Resource.availability_status == normalized_status)

    return query.order_by(Resource.id.asc()).all()


@router.get("/{id}", response_model=ResourceResponse)
def get_resource(id: int, db: Session = Depends(get_db)):
    res = db.query(Resource).filter(Resource.id == id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Resource with id {id} not found")
    return res


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(res_in: ResourceCreate, db: Session = Depends(get_db)):
    existing = db.query(Resource).filter(Resource.resource_code == res_in.resource_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Resource code {res_in.resource_code} already exists"
        )

    res = Resource(**res_in.model_dump())
    db.add(res)
    db.commit()
    db.refresh(res)
    return res


@router.put("/{id}", response_model=ResourceResponse)
def update_resource(id: int, res_update: ResourceUpdate, db: Session = Depends(get_db)):
    res = db.query(Resource).filter(Resource.id == id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Resource with id {id} not found")

    update_data = res_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(res, field, value)

    db.commit()
    db.refresh(res)
    return res


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(id: int, db: Session = Depends(get_db)):
    res = db.query(Resource).filter(Resource.id == id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Resource with id {id} not found")

    db.delete(res)
    db.commit()
    return None
