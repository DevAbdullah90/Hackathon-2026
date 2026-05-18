import asyncio
from fastapi.testclient import TestClient
from app.main import app

def test_dashboard_apis():
    with TestClient(app) as client:
        print("\n--- Testing /api/v1/dashboard/stats ---")
        response = client.get("/api/v1/dashboard/stats")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200

        print("\n--- Testing /api/v1/dashboard/agent-workforce ---")
        response = client.get("/api/v1/dashboard/agent-workforce")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200

        print("\n--- Testing /api/v1/dashboard/global-timeline ---")
        response = client.get("/api/v1/dashboard/global-timeline")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200

if __name__ == "__main__":
    test_dashboard_apis()
    print("\n✅ All dashboard APIs tested successfully!")

