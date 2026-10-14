from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ScheduleBase(BaseModel):
    mission_id: int
    resource_id: int
    start_time: datetime
    end_time: datetime
    delay_minutes: int = 0
    optimization_score: float = 90.0
    status: str = "SCHEDULED"


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleResponse(ScheduleBase):
    id: int
    created_at: datetime
    mission_code: Optional[str] = None
    resource_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
