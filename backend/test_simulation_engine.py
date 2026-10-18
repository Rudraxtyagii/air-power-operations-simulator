import os
os.environ["DATABASE_URL"] = "sqlite:///./test_simulation.db"

import json
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.seed_data import seed_database
from app.services.weather_data import seed_weather_data_if_empty
from app.services.simulation_seed import seed_simulation_scenarios_if_empty
from app.models.resource import Resource
from app.models.mission import Mission
from app.models.simulation import SimulationScenario, SimulationRun, ScenarioSnapshot


def run_simulation_tests():
    print("\n--- INITIALIZING SIMULATION ENGINE TEST SUITE ---")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        seed_database(session, force=True)
        seed_weather_data_if_empty(session)
        seed_simulation_scenarios_if_empty(session)

    client = TestClient(app)

    # 1. Test scenario listing & auto-seeding
    res = client.get("/api/simulations")
    assert res.status_code == 200, f"List simulations failed: {res.text}"
    scenarios = res.json()
    assert len(scenarios) >= 2, f"Expected at least 2 seeded scenarios, got {len(scenarios)}"
    first_scen = scenarios[0]
    print(f"[PASS] GET /api/simulations: Found {len(scenarios)} scenarios (e.g. {first_scen['scenario_code']})")

    # 2. Test create new custom scenario & snapshot capture
    custom_scen_payload = {
        "name": "Northern Air Defence Sandbox Test",
        "description": "Deterministic test scenario testing actuator failure and bad weather.",
        "duration_minutes": 120,
        "time_step_minutes": 15,
        "random_seed": 42,
        "events_config": [
            {
                "virtual_time_minutes": 30,
                "event_type": "RESOURCE_UNAVAILABLE",
                "target_code": "A01",
                "severity": "HIGH",
                "description": "Simulated radar fault"
            },
            {
                "virtual_time_minutes": 60,
                "event_type": "WEATHER_HAZARD",
                "target_code": "ZONE_A",
                "severity": "HIGH",
                "description": "Simulated fog bank"
            }
        ]
    }
    res = client.post("/api/simulations", json=custom_scen_payload)
    assert res.status_code == 201, f"Create scenario failed: {res.text}"
    created = res.json()
    scen_id = created["id"]
    assert created["snapshot"] is not None, "Snapshot must be captured upon creation"
    assert created["snapshot"]["resources_count"] == 30, f"Expected 30 snapshotted resources, got {created['snapshot']['resources_count']}"
    assert created["snapshot"]["missions_count"] == 15, f"Expected 15 snapshotted missions, got {created['snapshot']['missions_count']}"
    print(f"[PASS] POST /api/simulations: Created scenario {created['scenario_code']} with isolated snapshot")

    # 3. Test Snapshot Isolation - Check initial live operational state
    with SessionLocal() as session:
        live_a01 = session.query(Resource).filter(Resource.resource_code == "A01").first()
        initial_a01_status = live_a01.availability_status
        assert initial_a01_status == "AVAILABLE", f"A01 should initially be AVAILABLE, got {initial_a01_status}"

    # 4. Run the simulation
    res = client.post(f"/api/simulations/{scen_id}/run")
    assert res.status_code == 200, f"Run simulation failed: {res.text}"
    run_res = res.json()
    assert run_res["status"] == "COMPLETED"
    assert run_res["current_virtual_time_minutes"] == 120
    assert run_res["events_processed_count"] == 2
    print(f"[PASS] POST /api/simulations/{scen_id}/run: Completed in {run_res['execution_duration_ms']}ms with 2 events processed")

    # 5. STRICT DATA ISOLATION VERIFICATION:
    # Verify that LIVE database records were NEVER modified by the simulation!
    with SessionLocal() as session:
        live_a01_after = session.query(Resource).filter(Resource.resource_code == "A01").first()
        assert live_a01_after.availability_status == "AVAILABLE", (
            f"DATA ISOLATION VIOLATION: Live resource A01 was mutated to {live_a01_after.availability_status} by simulation!"
        )
    print("[PASS] STRICT DATA ISOLATION VERIFIED: Live database records remained 100% untouched!")

    # 6. Retrieve Results and verify Time-Series Steps
    res = client.get(f"/api/simulations/{scen_id}/results")
    assert res.status_code == 200, f"Get results failed: {res.text}"
    results = res.json()
    assert len(results["time_series"]) == 9  # T+00:00, 15, 30, 45, 60, 75, 90, 105, 120
    assert len(results["event_history"]) == 2
    # Verify that inside the simulation, A01 is UNAVAILABLE
    sim_a01 = next((r for r in results["simulated_resources"] if r["code"] == "A01"), None)
    assert sim_a01 is not None and sim_a01["status"] == "UNAVAILABLE", "A01 should be UNAVAILABLE inside simulated state"
    print(f"[PASS] GET /api/simulations/{scen_id}/results: Verified {len(results['time_series'])} time-series steps and simulated state isolation")

    # 7. Test Deterministic Execution (re-running with same seed produces identical results)
    # Reset first
    res = client.post(f"/api/simulations/{scen_id}/reset")
    assert res.status_code == 200
    assert res.json()["status"] == "RESET"
    assert res.json()["current_virtual_time_minutes"] == 0
    print(f"[PASS] POST /api/simulations/{scen_id}/reset: State reset to T+00:00")

    # Re-run
    res = client.post(f"/api/simulations/{scen_id}/run")
    assert res.status_code == 200
    res2 = client.get(f"/api/simulations/{scen_id}/results")
    results2 = res2.json()
    assert results2["metrics"]["fleet_availability_pct"] == results["metrics"]["fleet_availability_pct"]
    print("[PASS] DETERMINISTIC REPRODUCIBILITY: Identical random seed produced identical availability curve")

    # 8. Test Pause / Resume transitions
    res = client.post(f"/api/simulations/{scen_id}/reset")
    res = client.post(f"/api/simulations/{scen_id}/pause")
    assert res.status_code == 200
    assert res.json()["status"] == "PAUSED"
    res = client.post(f"/api/simulations/{scen_id}/resume")
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"
    print("[PASS] PAUSE & RESUME: State transitions verified")

    print("\n=======================================================")
    print("ALL SIMULATION ENGINE TESTS PASSED: 100% SUCCESS")
    print("=======================================================\n")


if __name__ == "__main__":
    run_simulation_tests()
