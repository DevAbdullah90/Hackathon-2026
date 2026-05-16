import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_MAPS_SERVER_KEY")

if not api_key:
    print("❌ Error: GOOGLE_MAPS_SERVER_KEY is not set in the .env file.")
    exit(1)

# Coordinates for G-10 Sector, Islamabad
lat, lng = 33.6844, 73.0479

url = "https://maps.googleapis.com/maps/api/geocode/json"
params = {
    "latlng": f"{lat},{lng}",
    "key": api_key
}

print("Testing Google Maps Geocoding API...")
response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()
    if data.get("status") == "OK":
        results = data.get("results", [])
        if results:
            print(f"[SUCCESS] Google Maps API is working.")
            print(f"Returned Address: {results[0]['formatted_address']}")
        else:
            print("[SUCCESS] API is working but returned zero results for the given coordinates.")
    else:
        print(f"[ERROR] API Error: {data.get('status')}")
        print(f"Error Message: {data.get('error_message', 'No message provided by Google')}")
else:
    print(f"[ERROR] HTTP Request Failed with status code: {response.status_code}")
    print(response.text)
