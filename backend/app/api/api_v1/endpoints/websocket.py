"""
app/api/api_v1/endpoints/websocket.py
─────────────────────────────────────
WebSocket endpoint for real-time streaming of reasoning logs.
Uses a ConnectionManager to handle multiple clients per incident.
"""

from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from uuid import UUID

router = APIRouter()

class ConnectionManager:
    """
    Manages active WebSocket connections indexed by incident_id.
    Enables targeted broadcasting of agent logs to specific incident views.
    """
    def __init__(self):
        # Map of incident_id (string) -> List of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # List of active WebSockets listening to the global stream
        self.active_global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, incident_id: str):
        await websocket.accept()
        if incident_id not in self.active_connections:
            self.active_connections[incident_id] = []
        self.active_connections[incident_id].append(websocket)
        print(f"📡 WebSocket connected for incident: {incident_id}")

    def disconnect(self, websocket: WebSocket, incident_id: str):
        if incident_id in self.active_connections:
            self.active_connections[incident_id].remove(websocket)
            if not self.active_connections[incident_id]:
                del self.active_connections[incident_id]
        print(f"🔌 WebSocket disconnected for incident: {incident_id}")

    async def connect_global(self, websocket: WebSocket):
        await websocket.accept()
        self.active_global_connections.append(websocket)
        print("📡 Global WebSocket connected")

    def disconnect_global(self, websocket: WebSocket):
        if websocket in self.active_global_connections:
            self.active_global_connections.remove(websocket)
        print("🔌 Global WebSocket disconnected")

    async def broadcast(self, incident_id: str, message: dict):
        """Send a message to all clients subscribed to a specific incident_id."""
        if incident_id in self.active_connections:
            for connection in list(self.active_connections[incident_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"❌ Error broadcasting to WS: {e}")

    async def broadcast_global(self, message: dict):
        """Send a message to all clients subscribed to the global stream."""
        for connection in list(self.active_global_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"❌ Error broadcasting to global WS: {e}")

# Global instance for use in tools and endpoints
manager = ConnectionManager()

@router.websocket("/global/stream")
async def websocket_global_endpoint(websocket: WebSocket):
    """
    WebSocket handler for the global stream.
    Streams global events like new incidents, status changes, and simulation updates.
    """
    await manager.connect_global(websocket)
    try:
        while True:
            # Keep the connection open.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_global(websocket)
    except Exception as e:
        print(f"⚠️ Global WS Error: {e}")
        manager.disconnect_global(websocket)

@router.websocket("/{incident_id}")
async def websocket_endpoint(websocket: WebSocket, incident_id: str):
    """
    WebSocket handler for a specific incident.
    Streams logs as they are pushed via manager.broadcast().
    """
    await manager.connect(websocket, incident_id)
    try:
        while True:
            # Keep the connection open. We don't expect much client-to-server data.
            data = await websocket.receive_text()
            # Echo or handle client messages if needed in the future
    except WebSocketDisconnect:
        manager.disconnect(websocket, incident_id)
    except Exception as e:
        print(f"⚠️ WS Error: {e}")
        manager.disconnect(websocket, incident_id)
