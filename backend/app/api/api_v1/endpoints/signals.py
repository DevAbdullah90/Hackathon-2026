"""
app/api/api_v1/endpoints/signals.py
───────────────────────────────────
Endpoint for ingesting raw signals from users, weather APIs, and traffic monitors.
"""

from fastapi import APIRouter, HTTPException, status
from app.models.schemas import SignalCreate, SignalRead

router = APIRouter()

@router.post("/", response_model=SignalRead, status_code=status.HTTP_201_CREATED)
async def create_signal(signal_in: SignalCreate):
    """
    Ingest a new raw signal.
    
    This endpoint:
    1. Receives GPS + payload
    2. Saves to 'signals' table (DB logic PENDING Quratulain's setup)
    3. Triggers the Agentic Pipeline (Phase 2)
    """
    # TODO: Integrate with database (SQLModel + AsyncSession)
    # For now, we return a mock response as we build the structure
    
    # Example logic:
    # signal = Signal(**signal_in.dict())
    # session.add(signal)
    # await session.commit()
    # return signal
    
    return {
        "id": "mock-uuid-123",
        "source": signal_in.source,
        "lat": signal_in.lat,
        "lng": signal_in.lng,
        "location": "G-10 Sector, Islamabad (Mock)",
        "credibility_score": 0.70,
        "created_at": "2026-05-15T09:12:00Z"
    }


@router.get("/", response_model=list[SignalRead])
async def get_signals():
    """List all received signals."""
    return []
