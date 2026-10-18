import os
os.environ["DATABASE_URL"] = "sqlite:///./test_endpoints.db"

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.seed_data import seed_database


def run_tests():
    # Setup test database
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Test seed
    with SessionLocal() as session:
        seed_res = seed_database(session, force=True)
        print("Seed result:", seed_res)
        assert seed_res["missions_seeded"] == 15, "Expected 15 missions seeded"
        assert seed_res["resources_seeded"] == 30, "Expected 30 resources seeded"

    client = TestClient(app)

    # 1. Health
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] GET /api/health: OK")

    # 2. Missions
    res = client.get("/api/missions")
    assert res.status_code == 200
    missions = res.json()
    assert len(missions) == 15, f"Expected 15 missions, got {len(missions)}"
    first_m_id = missions[0]["id"]
    print(f"[PASS] GET /api/missions: OK ({len(missions)} missions)")

    res = client.get(f"/api/missions/{first_m_id}")
    assert res.status_code == 200
    print(f"[PASS] GET /api/missions/{first_m_id}: OK")

    # POST new mission
    post_data = {
        "mission_code": "M999",
        "name": "Synthetic Intercept Test",
        "priority": "HIGH",
        "zone": "ZONE_C",
        "duration_minutes": 90,
        "start_window": "2026-10-14T10:00:00Z",
        "end_window": "2026-10-14T12:00:00Z",
        "required_resource_type": "TYPE_A",
        "required_resource_count": 1,
        "status": "PENDING"
    }
    res = client.post("/api/missions", json=post_data)
    assert res.status_code == 201, f"POST mission failed: {res.text}"
    created_m = res.json()
    created_m_id = created_m["id"]
    print(f"[PASS] POST /api/missions: OK (ID: {created_m_id})")

    # PUT mission
    res = client.put(f"/api/missions/{created_m_id}", json={"status": "SCHEDULED", "duration_minutes": 100})
    assert res.status_code == 200
    assert res.json()["status"] == "SCHEDULED"
    print(f"[PASS] PUT /api/missions/{created_m_id}: OK")

    # DELETE mission
    res = client.delete(f"/api/missions/{created_m_id}")
    assert res.status_code == 204
    print(f"[PASS] DELETE /api/missions/{created_m_id}: OK")

    # 3. Resources
    res = client.get("/api/resources")
    assert res.status_code == 200
    resources = res.json()
    assert len(resources) == 30, f"Expected 30 resources, got {len(resources)}"
    avail_count = sum(1 for r in resources if r["availability_status"] == "AVAILABLE")
    assert avail_count == 24, f"Expected 24 available resources, got {avail_count}"
    first_r_id = resources[0]["id"]
    print(f"[PASS] GET /api/resources: OK ({len(resources)} total, {avail_count} available)")

    res = client.get(f"/api/resources/{first_r_id}")
    assert res.status_code == 200
    print(f"[PASS] GET /api/resources/{first_r_id}: OK")

    # POST new resource
    res_post_data = {
        "resource_code": "A99",
        "resource_type": "TYPE_B",
        "capacity": 2,
        "availability_status": "AVAILABLE",
        "fuel_level": 95,
        "maintenance_status": "NORMAL",
        "operating_hours": 10.0,
        "current_zone": "ZONE_A",
        "home_base": "BASE_1",
        "predicted_availability": 94
    }
    res = client.post("/api/resources", json=res_post_data)
    assert res.status_code == 201
    created_r = res.json()
    created_r_id = created_r["id"]
    print(f"[PASS] POST /api/resources: OK (ID: {created_r_id})")

    # PUT resource
    res = client.put(f"/api/resources/{created_r_id}", json={"fuel_level": 80, "availability_status": "IN_MISSION"})
    assert res.status_code == 200
    assert res.json()["fuel_level"] == 80
    print(f"[PASS] PUT /api/resources/{created_r_id}: OK")

    # DELETE resource
    res = client.delete(f"/api/resources/{created_r_id}")
    assert res.status_code == 204
    print(f"[PASS] DELETE /api/resources/{created_r_id}: OK")

    # 4. Schedules
    res = client.get("/api/schedules")
    assert res.status_code == 200
    schedules = res.json()
    assert len(schedules) >= 1
    sched_id = schedules[0]["id"]
    print(f"[PASS] GET /api/schedules: OK ({len(schedules)} schedules)")

    res = client.get(f"/api/schedules/{sched_id}")
    assert res.status_code == 200
    print(f"[PASS] GET /api/schedules/{sched_id}: OK")

    # 5. Simulation Events
    res = client.get("/api/simulation/events")
    assert res.status_code == 200
    events = res.json()
    print(f"[PASS] GET /api/simulation/events: OK ({len(events)} events)")

    # POST Simulation Event
    event_post = {
        "event_type": "RESOURCE_UNAVAILABLE",
        "affected_resource_id": first_r_id,
        "severity": "HIGH",
        "description": "Simulated actuator calibration warning"
    }
    res = client.post("/api/simulation/events", json=event_post)
    assert res.status_code == 201
    print(f"[PASS] POST /api/simulation/events: OK")

    # Verify resource status updated to UNAVAILABLE
    res = client.get(f"/api/resources/{first_r_id}")
    assert res.json()["availability_status"] == "UNAVAILABLE"
    # Weather endpoints
    res = client.get("/api/weather/overview")
    assert res.status_code == 200
    print(f"[PASS] GET /api/weather/overview: OK ({len(res.json()['zones'])} zones)")

    res = client.get("/api/weather/live-india")
    assert res.status_code == 200
    live_data = res.json()
    assert live_data["status"] in ["LIVE", "STALE", "OFFLINE"]
    assert len(live_data["states"]) == 36
    print(f"[PASS] GET /api/weather/live-india: OK ({len(live_data['states'])} Indian states/UTs monitored)")

    print("\n==========================================")
    print("ALL API ENDPOINTS TESTED AND VERIFIED: 100% SUCCESS")
    print("==========================================")


if __name__ == "__main__":
    run_tests()
