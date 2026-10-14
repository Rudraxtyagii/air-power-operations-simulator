from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


def normalize_resource_type(v: str) -> str:
    cleaned = v.strip().upper().replace("-", "_").replace(" ", "_")
    if cleaned in ["TYPE_A", "TYPE_B", "TYPE_C"]:
        return cleaned
    raise ValueError(f"Invalid resource type: {v}. Must be TYPE_A, TYPE_B, or TYPE_C.")


def normalize_availability(v: str) -> str:
    cleaned = v.strip().upper().replace(" ", "_").replace("-", "_")
    if cleaned in ["AVAILABLE", "IN_MISSION", "UNAVAILABLE", "MAINTENANCE"]:
        return cleaned
    raise ValueError(f"Invalid availability: {v}. Must be AVAILABLE, IN_MISSION, UNAVAILABLE, or MAINTENANCE.")


def normalize_maintenance(v: str) -> str:
    cleaned = v.strip().upper()
    if cleaned in ["NORMAL", "ATTENTION", "MAINTENANCE"]:
        return cleaned
    raise ValueError(f"Invalid maintenance status: {v}. Must be NORMAL, ATTENTION, or MAINTENANCE.")


def normalize_zone(v: str) -> str:
    cleaned = v.strip().upper().replace(" ", "_").replace("-", "_")
    if cleaned in ["ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D"]:
        return cleaned
    raise ValueError(f"Invalid zone: {v}. Must be ZONE_A, ZONE_B, ZONE_C, or ZONE_D.")


def normalize_base(v: str) -> str:
    cleaned = v.strip().upper().replace(" ", "_").replace("-", "_")
    if cleaned in ["BASE_1", "BASE_2", "BASE_3", "BASE_4"]:
        return cleaned
    raise ValueError(f"Invalid home base: {v}. Must be BASE_1, BASE_2, BASE_3, or BASE_4.")


class ResourceBase(BaseModel):
    resource_code: str
    resource_type: str = "TYPE_A"
    capacity: int = 1
    availability_status: str = "AVAILABLE"
    fuel_level: int = Field(ge=0, le=100, default=100)
    maintenance_status: str = "NORMAL"
    operating_hours: float = 0.0
    current_zone: str = "ZONE_A"
    home_base: str = "BASE_1"
    predicted_availability: int = Field(ge=0, le=100, default=90)

    @field_validator("resource_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        return normalize_resource_type(v)

    @field_validator("availability_status")
    @classmethod
    def validate_availability(cls, v: str) -> str:
        return normalize_availability(v)

    @field_validator("maintenance_status")
    @classmethod
    def validate_maintenance(cls, v: str) -> str:
        return normalize_maintenance(v)

    @field_validator("current_zone")
    @classmethod
    def validate_zone(cls, v: str) -> str:
        return normalize_zone(v)

    @field_validator("home_base")
    @classmethod
    def validate_base(cls, v: str) -> str:
        return normalize_base(v)


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    resource_type: Optional[str] = None
    capacity: Optional[int] = None
    availability_status: Optional[str] = None
    fuel_level: Optional[int] = Field(None, ge=0, le=100)
    maintenance_status: Optional[str] = None
    operating_hours: Optional[float] = None
    current_zone: Optional[str] = None
    home_base: Optional[str] = None
    predicted_availability: Optional[int] = Field(None, ge=0, le=100)

    @field_validator("resource_type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        return normalize_resource_type(v) if v is not None else None

    @field_validator("availability_status")
    @classmethod
    def validate_availability(cls, v: Optional[str]) -> Optional[str]:
        return normalize_availability(v) if v is not None else None

    @field_validator("maintenance_status")
    @classmethod
    def validate_maintenance(cls, v: Optional[str]) -> Optional[str]:
        return normalize_maintenance(v) if v is not None else None

    @field_validator("current_zone")
    @classmethod
    def validate_zone(cls, v: Optional[str]) -> Optional[str]:
        return normalize_zone(v) if v is not None else None

    @field_validator("home_base")
    @classmethod
    def validate_base(cls, v: Optional[str]) -> Optional[str]:
        return normalize_base(v) if v is not None else None


class ResourceResponse(ResourceBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
