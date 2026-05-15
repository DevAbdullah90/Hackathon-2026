import uuid
from typing import List, Dict, Any
from app.models.incidents import Incident
from app.tools.notify import send_notification

async def process_notifications(incident: Incident) -> List[Dict[str, Any]]:
    """
    Notification Agent: Generates 6 tailored messages for stakeholders
    and persists them to the database using the notify tool.
    """
    # 1. Public
    public_msg = (
        f"Flood alert in {incident.location}. Avoid main boulevard. "
        "Use nearest alternate route."
    )
    
    # 2. Hospital (PIMS/Emergency)
    hospital_msg = (
        "Prepare 5 trauma/hypothermia beds. Flood victims may arrive "
        f"in {incident.peak_impact_eta or '20-40 mins'}."
    )
    
    # 3. Utility Company
    utility_msg = (
        f"Water main suspected at {incident.location} junction. "
        "Dispatch inspection team immediately."
    )
    
    # 4. Traffic Authority
    traffic_msg = (
        f"Activate alternate routing for {incident.location}. "
        "Divert traffic from main boulevard to service roads."
    )
    
    # 5. Emergency Services (1122)
    emergency_msg = (
        f"Deploy 2 rescue teams to GPS: {incident.lat}, {incident.lng}. "
        f"Incident ID: {str(incident.id)[:8]}."
    )
    
    # 6. Command Center / Media
    command_msg = (
        f"Crisis Level {incident.severity_score} declared. {incident.location} Urban Flood. "
        f"{incident.estimated_population} residents affected. Response activated."
    )
    
    notifications_to_send = [
        ("public", public_msg),
        ("hospital", hospital_msg),
        ("utility", utility_msg),
        ("traffic_auth", traffic_msg),
        ("emergency_services", emergency_msg),
        ("command_center", command_msg),
    ]
    
    results = []
    for stakeholder, message in notifications_to_send:
        result = await send_notification(
            stakeholder=stakeholder,
            message=message,
            incident_id=incident.id
        )
        results.append(result)
        
    return results
