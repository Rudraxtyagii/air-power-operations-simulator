from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.mission import Mission
from app.models.resource import Resource
from app.models.schedule import Schedule
from app.models.simulation_event import SimulationEvent


def seed_database(db: Session, force: bool = False):
    """
    Seeds database with 15 synthetic missions, 30 synthetic resources,
    initial schedules, and simulation events.
    100% synthetic, fictitious operational decision-support data for SIH26250.
    """
    mission_count = db.query(Mission).count()
    if mission_count > 0 and not force:
        return {
            "status": "skipped",
            "message": f"Database already contains {mission_count} missions. Skipping seed."
        }

    # If force, clear existing entries
    if force:
        db.query(SimulationEvent).delete()
        db.query(Schedule).delete()
        db.query(Mission).delete()
        db.query(Resource).delete()
        db.commit()

    now = datetime.now(timezone.utc)

    # 1. 30 Synthetic Fleet Resources (24 AVAILABLE, 3 IN_MISSION, 2 MAINTENANCE, 1 UNAVAILABLE)
    resources_data = [
        # Resources matching existing mockup
        {"code": "A01", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 86, "maint": "NORMAL", "hours": 142.5, "zone": "ZONE_A", "base": "BASE_1", "pred": 96},
        {"code": "A02", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 63, "maint": "NORMAL", "hours": 188.0, "zone": "ZONE_B", "base": "BASE_2", "pred": 84},
        {"code": "A03", "type": "TYPE_B", "cap": 2, "status": "UNAVAILABLE", "fuel": 20, "maint": "ATTENTION", "hours": 320.5, "zone": "ZONE_C", "base": "BASE_1", "pred": 32},
        {"code": "A04", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 91, "maint": "NORMAL", "hours": 94.2, "zone": "ZONE_D", "base": "BASE_3", "pred": 91},
        {"code": "A05", "type": "TYPE_C", "cap": 4, "status": "AVAILABLE", "fuel": 74, "maint": "NORMAL", "hours": 210.1, "zone": "ZONE_A", "base": "BASE_2", "pred": 87},
        {"code": "A06", "type": "TYPE_A", "cap": 1, "status": "IN_MISSION", "fuel": 58, "maint": "NORMAL", "hours": 165.4, "zone": "ZONE_A", "base": "BASE_1", "pred": 79},
        {"code": "A07", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 67, "maint": "NORMAL", "hours": 128.8, "zone": "ZONE_B", "base": "BASE_1", "pred": 88},
        {"code": "A08", "type": "TYPE_C", "cap": 4, "status": "MAINTENANCE", "fuel": 40, "maint": "MAINTENANCE", "hours": 450.0, "zone": "ZONE_D", "base": "BASE_4", "pred": 35},
        
        # Additional resources to complete 30 total assets (19 Available, 2 In Mission, 1 Maintenance)
        {"code": "A09", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 95, "maint": "NORMAL", "hours": 62.0, "zone": "ZONE_A", "base": "BASE_1", "pred": 98},
        {"code": "A10", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 82, "maint": "NORMAL", "hours": 115.3, "zone": "ZONE_B", "base": "BASE_2", "pred": 92},
        {"code": "A11", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 78, "maint": "NORMAL", "hours": 134.0, "zone": "ZONE_C", "base": "BASE_3", "pred": 89},
        {"code": "A12", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 88, "maint": "NORMAL", "hours": 87.5, "zone": "ZONE_D", "base": "BASE_4", "pred": 94},
        {"code": "A13", "type": "TYPE_C", "cap": 4, "status": "AVAILABLE", "fuel": 90, "maint": "NORMAL", "hours": 102.2, "zone": "ZONE_A", "base": "BASE_1", "pred": 95},
        {"code": "A14", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 84, "maint": "NORMAL", "hours": 140.0, "zone": "ZONE_B", "base": "BASE_2", "pred": 90},
        {"code": "A15", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 72, "maint": "NORMAL", "hours": 155.6, "zone": "ZONE_C", "base": "BASE_3", "pred": 86},
        {"code": "A16", "type": "TYPE_C", "cap": 4, "status": "AVAILABLE", "fuel": 81, "maint": "NORMAL", "hours": 178.4, "zone": "ZONE_D", "base": "BASE_4", "pred": 88},
        {"code": "A17", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 93, "maint": "NORMAL", "hours": 75.1, "zone": "ZONE_A", "base": "BASE_1", "pred": 97},
        {"code": "A18", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 76, "maint": "NORMAL", "hours": 190.2, "zone": "ZONE_B", "base": "BASE_2", "pred": 85},
        {"code": "A19", "type": "TYPE_C", "cap": 4, "status": "AVAILABLE", "fuel": 85, "maint": "NORMAL", "hours": 130.8, "zone": "ZONE_C", "base": "BASE_3", "pred": 92},
        {"code": "A20", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 89, "maint": "NORMAL", "hours": 105.7, "zone": "ZONE_D", "base": "BASE_4", "pred": 93},
        {"code": "A21", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 92, "maint": "NORMAL", "hours": 82.4, "zone": "ZONE_A", "base": "BASE_1", "pred": 96},
        {"code": "A22", "type": "TYPE_C", "cap": 4, "status": "AVAILABLE", "fuel": 79, "maint": "NORMAL", "hours": 160.0, "zone": "ZONE_B", "base": "BASE_2", "pred": 87},
        {"code": "A23", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 87, "maint": "NORMAL", "hours": 118.5, "zone": "ZONE_C", "base": "BASE_3", "pred": 91},
        {"code": "A24", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 75, "maint": "NORMAL", "hours": 204.1, "zone": "ZONE_D", "base": "BASE_4", "pred": 83},
        {"code": "A25", "type": "TYPE_C", "cap": 4, "status": "AVAILABLE", "fuel": 94, "maint": "NORMAL", "hours": 70.3, "zone": "ZONE_A", "base": "BASE_1", "pred": 97},
        {"code": "A26", "type": "TYPE_A", "cap": 1, "status": "AVAILABLE", "fuel": 83, "maint": "NORMAL", "hours": 125.0, "zone": "ZONE_B", "base": "BASE_2", "pred": 89},
        {"code": "A27", "type": "TYPE_B", "cap": 2, "status": "AVAILABLE", "fuel": 80, "maint": "NORMAL", "hours": 145.2, "zone": "ZONE_C", "base": "BASE_3", "pred": 90},
        {"code": "A28", "type": "TYPE_B", "cap": 2, "status": "IN_MISSION", "fuel": 54, "maint": "NORMAL", "hours": 210.0, "zone": "ZONE_B", "base": "BASE_2", "pred": 81},
        {"code": "A29", "type": "TYPE_C", "cap": 4, "status": "IN_MISSION", "fuel": 62, "maint": "NORMAL", "hours": 195.0, "zone": "ZONE_C", "base": "BASE_3", "pred": 83},
        {"code": "A30", "type": "TYPE_A", "cap": 1, "status": "MAINTENANCE", "fuel": 30, "maint": "MAINTENANCE", "hours": 490.0, "zone": "ZONE_D", "base": "BASE_4", "pred": 40},
    ]

    resource_objs = {}
    for r in resources_data:
        res = Resource(
            resource_code=r["code"],
            resource_type=r["type"],
            capacity=r["cap"],
            availability_status=r["status"],
            fuel_level=r["fuel"],
            maintenance_status=r["maint"],
            operating_hours=r["hours"],
            current_zone=r["zone"],
            home_base=r["base"],
            predicted_availability=r["pred"],
        )
        db.add(res)
        resource_objs[r["code"]] = res

    db.flush()

    # 2. 15 Synthetic Missions (8 ACTIVE, 5 COMPLETED, 1 DELAYED, 1 SCHEDULED -> ~93% Completion)
    missions_data = [
        {"code": "M001", "name": "Reconnaissance Alpha", "priority": "HIGH", "zone": "ZONE_A", "dur": 120, "start_h": -1, "end_h": 1, "res_type": "TYPE_A", "res_cnt": 2, "status": "ACTIVE"},
        {"code": "M002", "name": "Surveillance Bravo", "priority": "MEDIUM", "zone": "ZONE_B", "dur": 180, "start_h": -2, "end_h": 1, "res_type": "TYPE_B", "res_cnt": 1, "status": "ACTIVE"},
        {"code": "M003", "name": "Support Charlie", "priority": "HIGH", "zone": "ZONE_C", "dur": 180, "start_h": -1, "end_h": 2, "res_type": "TYPE_A", "res_cnt": 2, "status": "ACTIVE"},
        {"code": "M004", "name": "Patrol Delta", "priority": "LOW", "zone": "ZONE_D", "dur": 180, "start_h": 0, "end_h": 3, "res_type": "TYPE_B", "res_cnt": 1, "status": "ACTIVE"},
        {"code": "M005", "name": "Logistics Echo", "priority": "MEDIUM", "zone": "ZONE_A", "dur": 240, "start_h": -3, "end_h": 1, "res_type": "TYPE_C", "res_cnt": 2, "status": "ACTIVE"},
        {"code": "M006", "name": "Recon Foxtrot", "priority": "HIGH", "zone": "ZONE_B", "dur": 120, "start_h": -1, "end_h": 1, "res_type": "TYPE_A", "res_cnt": 1, "status": "ACTIVE"},
        {"code": "M007", "name": "Strike Support", "priority": "HIGH", "zone": "ZONE_C", "dur": 240, "start_h": 0, "end_h": 4, "res_type": "TYPE_B", "res_cnt": 2, "status": "ACTIVE"},
        {"code": "M008", "name": "SAR Operation", "priority": "MEDIUM", "zone": "ZONE_D", "dur": 240, "start_h": 1, "end_h": 5, "res_type": "TYPE_A", "res_cnt": 1, "status": "ACTIVE"},
        {"code": "M009", "name": "Airborne Early Warning Golf", "priority": "HIGH", "zone": "ZONE_A", "dur": 180, "start_h": -6, "end_h": -3, "res_type": "TYPE_C", "res_cnt": 1, "status": "COMPLETED"},
        {"code": "M010", "name": "Boundary Patrol Hotel", "priority": "LOW", "zone": "ZONE_B", "dur": 120, "start_h": -5, "end_h": -3, "res_type": "TYPE_B", "res_cnt": 1, "status": "COMPLETED"},
        {"code": "M011", "name": "Weather Recon India", "priority": "MEDIUM", "zone": "ZONE_C", "dur": 90, "start_h": -4, "end_h": -2, "res_type": "TYPE_A", "res_cnt": 1, "status": "COMPLETED"},
        {"code": "M012", "name": "Airfield Defense Juliet", "priority": "HIGH", "zone": "ZONE_D", "dur": 150, "start_h": 2, "end_h": 5, "res_type": "TYPE_A", "res_cnt": 2, "status": "DELAYED"},
        {"code": "M013", "name": "Escort Sortie Kilo", "priority": "MEDIUM", "zone": "ZONE_A", "dur": 120, "start_h": -8, "end_h": -6, "res_type": "TYPE_B", "res_cnt": 1, "status": "COMPLETED"},
        {"code": "M014", "name": "Cargo Resupply Lima", "priority": "LOW", "zone": "ZONE_C", "dur": 200, "start_h": -7, "end_h": -4, "res_type": "TYPE_C", "res_cnt": 1, "status": "COMPLETED"},
        {"code": "M015", "name": "High-Altitude Survey Mike", "priority": "HIGH", "zone": "ZONE_B", "dur": 160, "start_h": 3, "end_h": 6, "res_type": "TYPE_A", "res_cnt": 1, "status": "SCHEDULED"},
    ]

    mission_objs = {}
    for m in missions_data:
        start_time = now + timedelta(hours=m["start_h"])
        end_time = now + timedelta(hours=m["end_h"])
        mis = Mission(
            mission_code=m["code"],
            name=m["name"],
            priority=m["priority"],
            zone=m["zone"],
            duration_minutes=m["dur"],
            start_window=start_time,
            end_window=end_time,
            required_resource_type=m["res_type"],
            required_resource_count=m["res_cnt"],
            status=m["status"],
        )
        db.add(mis)
        mission_objs[m["code"]] = mis

    db.flush()

    # 3. Synthetic Initial Schedules
    schedules_data = [
        {"mission": "M001", "resource": "A01", "start": now - timedelta(hours=1), "end": now + timedelta(hours=1), "score": 94.5},
        {"mission": "M002", "resource": "A04", "start": now - timedelta(hours=2), "end": now + timedelta(hours=1), "score": 92.0},
        {"mission": "M003", "resource": "A02", "start": now - timedelta(hours=1), "end": now + timedelta(hours=2), "score": 93.8},
        {"mission": "M004", "resource": "A05", "start": now, "end": now + timedelta(hours=3), "score": 91.2},
        {"mission": "M005", "resource": "A06", "start": now - timedelta(hours=3), "end": now + timedelta(hours=1), "score": 89.5},
        {"mission": "M006", "resource": "A07", "start": now - timedelta(hours=1), "end": now + timedelta(hours=1), "score": 95.0},
    ]

    for s in schedules_data:
        sched = Schedule(
            mission_id=mission_objs[s["mission"]].id,
            resource_id=resource_objs[s["resource"]].id,
            start_time=s["start"],
            end_time=s["end"],
            delay_minutes=0,
            optimization_score=s["score"],
            status="SCHEDULED",
        )
        db.add(sched)

    # 4. Synthetic Recent Simulation Events
    events_data = [
        {"type": "RESOURCE_UNAVAILABLE", "res": "A07", "mis": None, "sev": "HIGH", "desc": "Aircraft A07 reporting hydraulic pressure telemetry drop; unavailable."},
        {"type": "WEATHER_DISRUPTION", "res": None, "mis": "M002", "sev": "CRITICAL", "desc": "Convective thunderstorm squall front entering Sector Zone B."},
        {"type": "MISSION_DELAYED", "res": None, "mis": "M012", "sev": "MEDIUM", "desc": "Sortie M012 delayed due to runway maintenance queue buffer."},
        {"type": "RESOURCE_RTB", "res": "A04", "mis": None, "sev": "LOW", "desc": "Aircraft A04 safely completed mission and returned to Base-3."},
    ]

    for e in events_data:
        res_id = resource_objs[e["res"]].id if e["res"] else None
        mis_id = mission_objs[e["mis"]].id if e["mis"] else None
        event = SimulationEvent(
            event_type=e["type"],
            affected_resource_id=res_id,
            affected_mission_id=mis_id,
            severity=e["sev"],
            description=e["desc"],
        )
        db.add(event)

    db.commit()

    return {
        "status": "success",
        "missions_seeded": len(missions_data),
        "resources_seeded": len(resources_data),
        "schedules_seeded": len(schedules_data),
        "events_seeded": len(events_data),
    }
