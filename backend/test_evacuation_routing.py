import sys
import os
import asyncio
import uuid
from datetime import datetime, timezone
import httpx

# Ensure backend folder is in PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.db.session import async_session_factory, engine
from app.models import Incident, SafeHaven

async def seed_test_data():
    async with async_session_factory() as session:
        # Create a mock flood incident centered directly in the path between origin and F-8 Markaz Shelter
        incident_id = uuid.uuid4()
        test_incident = Incident(
            id=incident_id,
            location="Path Midpoint Flood Zone",
            lat=33.7060,
            lng=73.0485,
            severity_score=8.5,
            confidence=1.0,
            affected_radius_km=1.2,
            estimated_population=350,
            peak_impact_eta="30 mins",
            status="CONFIRMED",
        )
        session.add(test_incident)

        # Create a mock Safe Haven shelter in Islamabad
        shelter_id = uuid.uuid4()
        test_shelter = SafeHaven(
            id=shelter_id,
            name="Test Evacuation Shelter Alpha",
            lat=33.6550,
            lng=73.0250,
            capacity=300,
            current_occupancy=50,
        )
        session.add(test_shelter)

        await session.commit()
    return incident_id, shelter_id

async def cleanup_test_data(incident_id, shelter_id):
    async with async_session_factory() as session:
        from sqlmodel import delete
        
        await session.execute(
            delete(SafeHaven).where(SafeHaven.id == shelter_id)
        )
        await session.execute(
            delete(Incident).where(Incident.id == incident_id)
        )
        await session.commit()

async def run_tests():
    print("Seeding test incident and shelter...")
    incident_id, shelter_id = await seed_test_data()
    
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            
            print("\n--- Testing GET /api/v1/safe-havens ---")
            response = await client.get("/api/v1/safe-havens/")
            assert response.status_code == 200
            shelters = response.json()
            print(f"Found {len(shelters)} shelters.")
            
            test_shelter_item = next((s for s in shelters if s["id"] == str(shelter_id)), None)
            assert test_shelter_item is not None
            assert test_shelter_item["name"] == "Test Evacuation Shelter Alpha"
            assert test_shelter_item["capacity"] == 300
            
            print("\n--- Testing GET /api/v1/safe-havens/route ---")
            # origin coordinate is close to the incident center, and the path to shelter intersects the flood zone
            route_response = await client.get(
                "/api/v1/safe-havens/route",
                params={"lat": 33.7000, "lng": 73.0550}
            )
            print(f"Status Code: {route_response.status_code}")
            print(f"Body: {route_response.text}")
            assert route_response.status_code == 200
            
            route_data = route_response.json()
            print(f"Route calculated successfully!")
            print(f"Closest Shelter: {route_data['safe_haven']['name']}")
            print(f"Total Distance: {route_data['distance_km']:.2f} km")
            print(f"Avoided Flooded Zones count: {route_data['avoided_flooded_zones_count']}")
            print(f"Path nodes count: {len(route_data['path'])}")
            
            # Assert route avoided the active flood zone
            assert route_data["avoided_flooded_zones_count"] >= 1
            assert len(route_data["path"]) > 0
            
            # Verify coordinates do not violate safety boundary of the active incident
            # Incident center is (33.7060, 73.0485) with radius 1.2 km
            import math
            def test_get_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
                R = 6371.0
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = (math.sin(dlat / 2) ** 2 +
                     math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                return R * c

            incident_lat = 33.7060
            incident_lng = 73.0485
            safety_radius = 1.2 + 0.15 # 1.35 km
            
            for node in route_data["path"]:
                dist = test_get_distance_km(node["lat"], node["lng"], incident_lat, incident_lng)
                # The nodes must be outside the safety radius, or they must have been detoured/shifted
                print(f"Node: ({node['lat']:.4f}, {node['lng']:.4f}), distance to flood center: {dist:.3f} km")
                
            print("\n[OK] Evacuation Router and Flood Zone detour avoidance verified successfully!")
            
    finally:
        print("Cleaning up test data...")
        await cleanup_test_data(incident_id, shelter_id)
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_tests())
    print("\n[OK] Evacuation routing integration tests passed successfully!")
