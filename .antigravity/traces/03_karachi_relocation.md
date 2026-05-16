# Trace Log: 03 - Regional Relocation (Islamabad \u2192 Karachi)

## Task Description
Update the global map system to focus on Karachi as the primary deployment area.

## Agentic Reasoning
1. **Centralized Config**: Updated `app/constants/config.ts` first to ensure all map references pull from the same source of truth.
2. **Geographical Accuracy**: Relocated mock incidents to high-risk areas in Karachi (Gulshan, North Nazimabad).
3. **Route Realism**: Re-mapped the `MOCK_ROUTE` to originate from Karachi city center coordinates.

## Key Changes
- [MODIFY] `app/constants/config.ts` (Added `KARACHI_CENTER`)
- [MODIFY] `app/map.tsx` (Updated mock data coordinates & initialRegion)

## Verification
- Confirmed coordinate bounds match Karachi's geography.
- Verified that "Fly to location" feature correctly targets the new Karachi coordinates.
