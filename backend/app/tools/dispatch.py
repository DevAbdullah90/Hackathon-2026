import uuid
from typing import Dict, Any

async def generate_ticket(incident_id: uuid.UUID, service_type: str) -> Dict[str, Any]:
    """
    Creates a mock emergency service ticket (drainage, ambulance, etc.).
    In a real system, this would integrate with 1122 or similar dispatch APIs.
    """
    ticket_id = f"TICK-{uuid.uuid4().hex[:8].upper()}"
    
    # In Phase 1, we just return a structured mock response.
    # This contract allows the Planning Agent to receive a confirmation.
    return {
        "ticket_id": ticket_id,
        "incident_id": str(incident_id),
        "service_type": service_type,
        "status": "DISPATCHED",
        "estimated_arrival": "15-20 mins"
    }
