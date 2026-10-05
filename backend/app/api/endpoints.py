from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas.domain import MissionBase, ResourceBase, OptimizationRequest, DisruptionSimulateRequest

router = APIRouter()

# Synthetic Operational Data (Academic Demonstration Only)
SYNTHETIC_MISSIONS = [
    {"id": "M001", "name": "Reconnaissance Alpha", "priority": "High", "location": "Zone A", "time_window": "08:00 - 10:00", "required_resources": "2 Type-A", "status": "Scheduled"},
    {"id": "M002", "name": "Surveillance Bravo", "priority": "Medium", "location": "Zone B", "time_window": "09:00 - 12:00", "required_resources": "1 Type-B", "status": "Scheduled"},
    {"id": "M003", "name": "Support Charlie", "priority": "High", "location": "Zone C", "time_window": "10:00 - 13:00", "required_resources": "2 Type-A", "status": "Pending"},
    {"id": "M004", "name": "Patrol Delta", "priority": "Low", "location": "Zone D", "time_window": "11:00 - 14:00", "required_resources": "1 Type-B", "status": "Scheduled"},
    {"id": "M005", "name": "Logistics Echo", "priority": "Medium", "location": "Zone A", "time_window": "12:00 - 16:00", "required_resources": "2 Type-C", "status": "Pending"},
    {"id": "M006", "name": "Recon Foxtrot", "priority": "High", "location": "Zone B", "time_window": "13:00 - 15:00", "required_resources": "1 Type-A", "status": "Scheduled"},
    {"id": "M007", "name": "Strike Support", "priority": "High", "location": "Zone C", "time_window": "14:00 - 18:00", "required_resources": "2 Type-B", "status": "Pending"},
    {"id": "M008", "name": "SAR Operation", "priority": "Medium", "location": "Zone D", "time_window": "15:00 - 19:00", "required_resources": "1 Type-A", "status": "Delayed"},
]

SYNTHETIC_RESOURCES = [
    {"id": "A01", "type": "Type-A", "status": "Available", "fuel_level": 86, "maintenance": "Normal", "predicted_availability": 96, "current_location": "Base-1"},
    {"id": "A02", "type": "Type-A", "status": "Available", "fuel_level": 63, "maintenance": "Normal", "predicted_availability": 84, "current_location": "Base-2"},
    {"id": "A03", "type": "Type-B", "status": "Unavailable", "fuel_level": 20, "maintenance": "Maintenance", "predicted_availability": 32, "current_location": "Base-1"},
    {"id": "A04", "type": "Type-B", "status": "Available", "fuel_level": 91, "maintenance": "Normal", "predicted_availability": 91, "current_location": "Base-3"},
    {"id": "A05", "type": "Type-C", "status": "Available", "fuel_level": 74, "maintenance": "Normal", "predicted_availability": 87, "current_location": "Base-2"},
    {"id": "A06", "type": "Type-A", "status": "In Mission", "fuel_level": 58, "maintenance": "Normal", "predicted_availability": 79, "current_location": "Zone A"},
    {"id": "A07", "type": "Type-B", "status": "Available", "fuel_level": 67, "maintenance": "Normal", "predicted_availability": 88, "current_location": "Base-1"},
    {"id": "A08", "type": "Type-C", "status": "Maintenance", "fuel_level": 40, "maintenance": "Maintenance", "predicted_availability": 35, "current_location": "Base-4"},
]

@router.get("/health")
def health_check() -> Dict[str, str]:
    return {
        "status": "healthy",
        "service": "AI-Powered Dynamic Air Operations Backend",
        "mode": "synthetic_simulation"
    }

@router.get("/missions", response_model=List[MissionBase])
def get_missions() -> List[Dict[str, Any]]:
    return SYNTHETIC_MISSIONS

@router.get("/resources", response_model=List[ResourceBase])
def get_resources() -> List[Dict[str, Any]]:
    return SYNTHETIC_RESOURCES

@router.get("/dashboard/summary")
def get_dashboard_summary() -> Dict[str, Any]:
    return {
        "total_missions": 15,
        "available_aircraft": {"available": 24, "total": 30},
        "active_missions": 8,
        "mission_completion_pct": 93,
        "optimization_score": 92.7,
        "resource_readiness_pct": 89,
        "avg_mission_delay_mins": 7.4,
        "recent_alerts": [
            {"time": "10:24", "message": "Aircraft A07 unavailable", "type": "warning"},
            {"time": "10:12", "message": "Weather impact in Zone B", "type": "danger"},
            {"time": "09:55", "message": "Mission M012 delayed", "type": "alert"},
            {"time": "09:32", "message": "A04 returned to base", "type": "info"},
        ],
        "mission_status_counts": {
            "completed": 8,
            "ongoing": 4,
            "pending": 2,
            "delayed": 1
        }
    }
