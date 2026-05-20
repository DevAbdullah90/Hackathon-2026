import asyncio
from app.ai.tools.geo import reverse_geocode

async def main():
    # Test Islamabad coordinates
    addr_isl = await reverse_geocode.func(33.6844, 73.0479)
    print("Islamabad address:", addr_isl)

    # Test Karachi coordinates
    addr_khi = await reverse_geocode.func(24.918, 67.097)
    print("Karachi address:", addr_khi)

    # Test a completely different coordinate (e.g., office)
    addr_other = await reverse_geocode.func(34.015, 71.524) # Peshawar
    print("Other address:", addr_other)

if __name__ == "__main__":
    asyncio.run(main())
