from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


def normalize_severity(v: str) -> str:
    cleaned = v.strip().upper()
    if cleaned in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        return cleaned
    raise ValueError(f"Invalid severity: {v}. Must be LOW, MEDIUM, HIGH, or CRITICAL.")


class SimulationEventBase(BaseModel):
    event_type: str
    affected_resource_id: Optional[int] = None
    affected_mission_id: Optional[int] = None
    severity: str = "MEDIUM"
    description: str

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        return normalize_severity(v)


class SimulationEventCreate(SimulationEventBase):
    pass


class SimulationEventResponse(SimulationEventBase):
    id: int
    created_at: datetime
    affected_resource_code: Optional[str] = None
    affected_mission_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
