"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, Plus, Minus, RotateCcw } from "lucide-react";

// Fix Leaflet icon bug at top (outside component)
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Custom pulsing blue pin DivIcon
const pulsingIcon = typeof window !== "undefined" ? L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:28px;height:28px;">
      <div style="position:absolute;width:28px;height:28px;
           border-radius:50%;background:rgba(59,130,246,0.35);
           animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;top:5px;left:5px;width:18px;
           height:18px;border-radius:50%;background:#3b82f6;
           border:2.5px solid white;
           box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>
    </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
}) : null;

// Child component to access map instance for custom controls
function MapControls() {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Search Button */}
      <button
        onClick={() => {}}
        className="bg-white w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors border border-transparent"
        title="Search"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 w-full" />

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
        onClick={() => map.setView([30.2700, -97.7420], 15)}
        className="bg-white w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors border border-transparent"
        title="Reset Zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function MapPanel() {
  const centerPosition: [number, number] = [30.2700, -97.7420];

  return (
    <div 
      className="relative border-r border-gray-200 overflow-hidden"
      style={{ width: "420px", minWidth: "420px", height: "100%" }}
    >
      {pulsingIcon && (
        <MapContainer
          center={centerPosition}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={centerPosition} icon={pulsingIcon}>
            <Popup>
              <div className="text-xs font-semibold text-gray-800">
                7th & Comal (Segment ID: 7C2)
              </div>
            </Popup>
          </Marker>

          {/* Custom Controls Overlay */}
          <MapControls />
        </MapContainer>
      )}
    </div>
  );
}
