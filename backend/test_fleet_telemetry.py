import sys
import os
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import httpx

# Ensure backend folder is in PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.db.session import async_session_factory, engine
from app.models import Incident, VehicleLocation

async def seed_test_data():
    async with async_session_factory() as session:
        # Create a mock incident
        incident_id = uuid.uuid4()
        test_incident = Incident(
            id=incident_id,
            location="Test Karachi Bay Area",
            lat=24.8607,
            lng=67.0011,
            severity_score=5.0,
            confidence=1.0,
            affected_radius_km=1.0,
            estimated_population=100,
            peak_impact_eta="1 hr",
            status="MONITORING",
        )
        session.add(test_incident)

        # Vehicle 1: 15 seconds ago (elapsed = 15s out of 30s)
        vehicle1_id = uuid.uuid4()
        vehicle1 = VehicleLocation(
            id=vehicle1_id,
            vehicle_id="Test Boat 1",
            vehicle_type="rescue_boat",
            incident_id=incident_id,
            start_lat=24.8000,
            start_lng=67.0000,
            target_lat=24.8600,
            target_lng=67.0100,
            current_lat=24.8000,
            current_lng=67.0000,
            dispatch_time=datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=15),
            duration_seconds=30.0,
            status="en_route"
        )
        session.add(vehicle1)

        # Vehicle 2: 45 seconds ago (elapsed = 45s out of 30s) - should have arrived
        vehicle2_id = uuid.uuid4()
        vehicle2 = VehicleLocation(
            id=vehicle2_id,
            vehicle_id="Test Boat 2",
            vehicle_type="rescue_boat",
            incident_id=incident_id,
            start_lat=24.8000,
            start_lng=67.0000,
            target_lat=24.8600,
            target_lng=67.0100,
            current_lat=24.8000,
            current_lng=67.0000,
            dispatch_time=datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=45),
            duration_seconds=30.0,
            status="en_route"
        )
        session.add(vehicle2)

        await session.commit()
    return incident_id, vehicle1_id, vehicle2_id

async def cleanup_test_data(incident_id, vehicle1_id, vehicle2_id):
    async with async_session_factory() as session:
        from sqlmodel import delete
        
        await session.execute(
            delete(VehicleLocation).where(VehicleLocation.id.in_([vehicle1_id, vehicle2_id]))
        )
        await session.execute(
            delete(Incident).where(Incident.id == incident_id)
        )
        await session.commit()

async def run_tests():
    print("Seeding test incident and vehicles...")
    incident_id, v1_id, v2_id = await seed_test_data()
    
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            print("\n--- Fetching Fleet Locations ---")
            response = await client.get("/api/v1/resources/fleet")
            assert response.status_code == 200
            
            fleet = response.json()
            print(f"Found {len(fleet)} vehicles in telemetry.")
            
            v1_data = next((v for v in fleet if v["id"] == str(v1_id)), None)
            v2_data = next((v for v in fleet if v["id"] == str(v2_id)), None)
            
            assert v1_data is not None, "Vehicle 1 not returned"
            assert v2_data is not None, "Vehicle 2 not returned"
            
            # Assert Vehicle 1 is en route and coordinates are midway interpolated
            print(f"V1 position: {v1_data['current_lat']}, {v1_data['current_lng']} (status: {v1_data['status']})")
            assert v1_data["status"] == "en_route"
            assert v1_data["start_lat"] < v1_data["current_lat"] < v1_data["target_lat"]
            assert v1_data["start_lng"] < v1_data["current_lng"] < v1_data["target_lng"]
            
            # Assert Vehicle 2 is arrived and coordinates are exactly target coordinates
            print(f"V2 position: {v2_data['current_lat']}, {v2_data['current_lng']} (status: {v2_data['status']})")
            assert v2_data["status"] == "arrived"
            assert abs(v2_data["current_lat"] - 24.8600) < 0.0001
            assert abs(v2_data["current_lng"] - 67.0100) < 0.0001
            
            print("\n[OK] Coordinate interpolation and status transitions verified successfully!")
            
    finally:
        print("Cleaning up test data...")
        await cleanup_test_data(incident_id, v1_id, v2_id)
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_tests())
    print("\n[OK] Fleet Telemetry API tests passed successfully!")
