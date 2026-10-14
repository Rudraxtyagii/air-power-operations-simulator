from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


def normalize_priority(v: str) -> str:
    cleaned = v.strip().upper()
    if cleaned in ["HIGH", "MEDIUM", "LOW"]:
        return cleaned
    raise ValueError(f"Invalid priority: {v}. Must be HIGH, MEDIUM, or LOW.")


def normalize_zone(v: str) -> str:
    cleaned = v.strip().upper().replace(" ", "_").replace("-", "_")
    if cleaned in ["ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D"]:
        return cleaned
    raise ValueError(f"Invalid zone: {v}. Must be ZONE_A, ZONE_B, ZONE_C, or ZONE_D.")


def normalize_status(v: str) -> str:
    cleaned = v.strip().upper()
    if cleaned in ["PENDING", "SCHEDULED", "ACTIVE", "COMPLETED", "DELAYED"]:
        return cleaned
    raise ValueError(f"Invalid status: {v}. Must be PENDING, SCHEDULED, ACTIVE, COMPLETED, or DELAYED.")


def normalize_resource_type(v: str) -> str:
    cleaned = v.strip().upper().replace("-", "_").replace(" ", "_")
    if cleaned in ["TYPE_A", "TYPE_B", "TYPE_C"]:
        return cleaned
    raise ValueError(f"Invalid resource type: {v}. Must be TYPE_A, TYPE_B, or TYPE_C.")


class MissionBase(BaseModel):
    mission_code: str
    name: str
    priority: str = "MEDIUM"
    zone: str = "ZONE_A"
    duration_minutes: int = 120
    start_window: datetime
    end_window: datetime
    required_resource_type: str = "TYPE_A"
    required_resource_count: int = 1
    status: str = "PENDING"

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        return normalize_priority(v)

    @field_validator("zone")
    @classmethod
    def validate_zone(cls, v: str) -> str:
        return normalize_zone(v)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        return normalize_status(v)

    @field_validator("required_resource_type")
    @classmethod
    def validate_res_type(cls, v: str) -> str:
        return normalize_resource_type(v)


class MissionCreate(MissionBase):
    pass


class MissionUpdate(BaseModel):
    name: Optional[str] = None
    priority: Optional[str] = None
    zone: Optional[str] = None
    duration_minutes: Optional[int] = None
    start_window: Optional[datetime] = None
    end_window: Optional[datetime] = None
    required_resource_type: Optional[str] = None
    required_resource_count: Optional[int] = None
    status: Optional[str] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        return normalize_priority(v) if v is not None else None

    @field_validator("zone")
    @classmethod
    def validate_zone(cls, v: Optional[str]) -> Optional[str]:
        return normalize_zone(v) if v is not None else None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        return normalize_status(v) if v is not None else None

    @field_validator("required_resource_type")
    @classmethod
    def validate_res_type(cls, v: Optional[str]) -> Optional[str]:
        return normalize_resource_type(v) if v is not None else None


class MissionResponse(MissionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
