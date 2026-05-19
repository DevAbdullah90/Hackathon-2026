"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import { Search, Plus, Minus, RotateCcw, AlertTriangle, Shield, Eye } from "lucide-react";
import { api, Incident } from "@/lib/api";

// Fix Leaflet icon bug at top (outside component)
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Function to generate pulsing, severity-colored pins
function createSeverityIcon(severity: number) {
  if (typeof window === "undefined") return null;

  let color = "#ef4444"; // Critical Red (> 8.0)
  let shadow = "rgba(239, 68, 68, 0.4)";
  
  if (severity < 6.0) {
    color = "#eab308"; // Medium Yellow (< 6.0)
    shadow = "rgba(234, 179, 8, 0.4)";
  } else if (severity < 8.0) {
    color = "#f97316"; // High Orange (6.0 - 8.0)
    shadow = "rgba(249, 115, 22, 0.4)";
  }

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:32px;height:32px;">
        <div style="position:absolute;width:32px;height:32px;
             border-radius:50%;background:${shadow};
             animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;top:6px;left:6px;width:20px;
             height:20px;border-radius:50%;background:${color};
             border:2.5px solid white;
             box-shadow:0 3px 10px ${shadow};"></div>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Child component to access map instance for custom controls
interface MapControlsProps {
  center: [number, number];
}

function MapControls({ center }: MapControlsProps) {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Zoom In Button */}
      <button
        onClick={() => map.zoomIn()}
        className="bg-white w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors border border-transparent"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={() => map.zoomOut()}
        className="bg-white w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors border border-transparent"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 w-full" />

      {/* Reset View Button */}
      <button
        onClick={() => map.setView(center, 13)}
        className="bg-white w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors border border-transparent"
        title="Reset Zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

// Child component to smoothly pan/zoom map on selected incident
function MapCenterer({ selectedIncident }: { selectedIncident: Incident | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedIncident) {
      map.setView([selectedIncident.lat, selectedIncident.lng], 14, { animate: true });
    }
  }, [selectedIncident, map]);
  return null;
}

interface MapPanelProps {
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

export default function MapPanel({ selectedIncident, onSelectIncident }: MapPanelProps) {
  const isServer = typeof window === "undefined";
  const KARACHI_CENTER: [number, number] = [24.9088, 67.1282];
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchIncidents = async () => {
    try {
      const data = await api.getActiveIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load map incidents:", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000); // 3s real-time active polling
    return () => clearInterval(interval);
  }, []);

  // Generate routes relative to the active/selected incident
  const blockedRouteCoords: [number, number][] = selectedIncident ? [
    [selectedIncident.lat - 0.005, selectedIncident.lng - 0.005],
    [selectedIncident.lat - 0.002, selectedIncident.lng - 0.002],
    [selectedIncident.lat, selectedIncident.lng], // Flooded focal point
    [selectedIncident.lat + 0.002, selectedIncident.lng + 0.002],
    [selectedIncident.lat + 0.005, selectedIncident.lng + 0.005]
  ] : [];

  const detourRouteCoords: [number, number][] = selectedIncident ? [
    [selectedIncident.lat - 0.005, selectedIncident.lng - 0.005],
    [selectedIncident.lat - 0.004, selectedIncident.lng + 0.001],
    [selectedIncident.lat - 0.001, selectedIncident.lng + 0.005],
    [selectedIncident.lat + 0.002, selectedIncident.lng + 0.004],
    [selectedIncident.lat + 0.005, selectedIncident.lng + 0.005]
  ] : [];

  return (
    <div 
      className="relative border-r border-gray-200 overflow-hidden shadow-inner bg-slate-50"
      style={{ width: "420px", minWidth: "420px", height: "100%" }}
    >
      {!isServer && (
        <MapContainer
          center={KARACHI_CENTER}
          zoom={13}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenterer selectedIncident={selectedIncident} />

          {incidents.map((incident) => {
            const icon = createSeverityIcon(incident.severity_score);
            if (!icon) return null;

            return (
              <Marker 
                key={incident.id} 
                position={[incident.lat, incident.lng]} 
                icon={icon}
                eventHandlers={{
                  click: () => {
                    onSelectIncident(incident);
                  }
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px] text-gray-800">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900 border-b border-gray-100 pb-1.5 mb-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>{incident.location}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Severity Index:</span>
                        <span className="font-bold text-red-600">{incident.severity_score}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Affected Radius:</span>
                        <span className="font-semibold">{incident.affected_radius_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Population Affected:</span>
                        <span className="font-bold text-blue-600">{(incident.estimated_population).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">ETA Peak:</span>
                        <span className="font-semibold text-amber-600">{incident.peak_impact_eta}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-50 pt-1.5 mt-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-50 px-1 border rounded">
                          {incident.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Rerouting Layer Overlay */}
          {selectedIncident && (
            <>
              {/* Blocked Primary Corridor Route (Dashed Red Line) */}
              <Polyline 
                positions={blockedRouteCoords} 
                pathOptions={{ 
                  color: "#ef4444", 
                  dashArray: "6, 10", 
                  weight: 5,
                  opacity: 0.9
                }} 
              >
                <Tooltip permanent direction="top" opacity={0.9} className="font-mono text-[9px] bg-red-950 border border-red-500 text-red-400 font-extrabold uppercase p-1 px-1.5 rounded shadow">
                  🚧 PRIMARY CORRIDOR: BLOCKED (FLOOD)
                </Tooltip>
              </Polyline>

              {/* Detour Bypass Route (Solid Green Line) */}
              <Polyline 
                positions={detourRouteCoords} 
                pathOptions={{ 
                  color: "#10b981", 
                  weight: 6,
                  opacity: 0.95
                }} 
              >
                <Tooltip permanent direction="bottom" opacity={0.9} className="font-mono text-[9px] bg-emerald-950 border border-emerald-500 text-emerald-400 font-extrabold uppercase p-1 px-1.5 rounded shadow">
                  🚗 DETOUR BYPASS ACTIVE (CLEAR)
                </Tooltip>
              </Polyline>

              {/* Route Anchors */}
              <Marker 
                position={blockedRouteCoords[0]}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2.5px solid white;box-shadow:0 0 10px rgba(59,130,246,0.85);"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                })}
              />
              <Marker 
                position={blockedRouteCoords[blockedRouteCoords.length - 1]}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="width:14px;height:14px;border-radius:50%;background:#10b981;border:2.5px solid white;box-shadow:0 0 10px rgba(16,185,129,0.85);"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                })}
              />
            </>
          )}

          {/* Custom Controls Overlay */}
          <MapControls center={KARACHI_CENTER} />
        </MapContainer>
      )}
    </div>
  );
}
