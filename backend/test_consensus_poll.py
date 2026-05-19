import sys
import os

# Ensure backend folder is in PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_consensus():
    with TestClient(app) as client:
        print("\n--- Fetching Active Incidents ---")
        response = client.get("/api/v1/incidents/active")
        print(f"Active Incidents Status: {response.status_code}")
        incidents = response.json()
        print(f"Found {len(incidents)} active incidents.")

        if not incidents:
            print("No active incidents found to verify. Skipping verification test.")
            return

        target_incident = incidents[0]
        inc_id = target_incident["id"]
        print(f"Targeting Incident: {inc_id} at {target_incident['location']}")

        # 1. Test invalid vote value
        print("\n--- Testing Invalid Vote Value ---")
        resp_invalid = client.post(f"/api/v1/incidents/{inc_id}/verify", json={"vote": "maybe"})
        print(f"Invalid Vote Status: {resp_invalid.status_code}")
        print(f"Invalid Vote Response: {resp_invalid.json()}")
        assert resp_invalid.status_code == 400

        # 2. Test Confirm Vote
        print("\n--- Testing Confirm Vote ---")
        orig_confirm = target_incident.get("confirmations_count", 0)
        resp_confirm = client.post(f"/api/v1/incidents/{inc_id}/verify", json={"vote": "confirm"})
        print(f"Confirm Vote Status: {resp_confirm.status_code}")
        updated_incident = resp_confirm.json()
        print(f"Updated confirmations_count: {updated_incident.get('confirmations_count')}")
        assert resp_confirm.status_code == 200
        assert updated_incident.get("confirmations_count") == orig_confirm + 1

        # 3. Test Refute Vote
        print("\n--- Testing Refute Vote ---")
        orig_refute = target_incident.get("refutations_count", 0)
        resp_refute = client.post(f"/api/v1/incidents/{inc_id}/verify", json={"vote": "refute"})
        print(f"Refute Vote Status: {resp_refute.status_code}")
        updated_incident_refute = resp_refute.json()
        print(f"Updated refutations_count: {updated_incident_refute.get('refutations_count')}")
        assert resp_refute.status_code == 200
        assert updated_incident_refute.get("refutations_count") == orig_refute + 1

        # 4. Test Invalid Incident ID (404)
        print("\n--- Testing Invalid Incident ID ---")
        resp_404 = client.post("/api/v1/incidents/00000000-0000-0000-0000-000000000000/verify", json={"vote": "confirm"})
        print(f"404 Verify Status: {resp_404.status_code}")
        print(f"404 Response: {resp_404.json()}")
        assert resp_404.status_code == 404

if __name__ == "__main__":
    test_consensus()
    print("\n[OK] Consensus Poll API tests passed successfully!")
