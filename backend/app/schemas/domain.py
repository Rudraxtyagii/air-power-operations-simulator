from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class MissionPriority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class MissionStatus(str, Enum):
    SCHEDULED = "Scheduled"
    PENDING = "Pending"
    ONGOING = "Ongoing"
    COMPLETED = "Completed"
    DELAYED = "Delayed"


class ResourceStatus(str, Enum):
    AVAILABLE = "Available"
    IN_MISSION = "In Mission"
    MAINTENANCE = "Maintenance"
    UNAVAILABLE = "Unavailable"


class MissionBase(BaseModel):
    id: str
    name: str
    priority: MissionPriority
    location: str
    time_window: str
    required_resources: str
    status: MissionStatus


class ResourceBase(BaseModel):
    id: str
    type: str
    status: ResourceStatus
    fuel_level: int = Field(ge=0, le=100)
    maintenance: str
    predicted_availability: int = Field(ge=0, le=100)
    current_location: str


class OptimizationRequest(BaseModel):
    objective: str = "Minimize Delay (Balanced)"
    consider_weather: bool = True
    use_predicted_availability: bool = True
    enforce_maintenance_constraints: bool = True
    enable_dynamic_reoptimization: bool = True


class DisruptionSimulateRequest(BaseModel):
    disruption_type: str
    target_resource_id: Optional[str] = None
    target_zone: Optional[str] = None
