import React from "react";
import { Polygon, Polyline } from "react-native-maps";
import { Incident } from "../lib/api";
import { THEME } from "../lib/theme";

interface MapOverlayProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  isDetourActive?: boolean;
}

const MapOverlay: React.FC<MapOverlayProps> = ({ incidents, selectedIncident, isDetourActive = false }) => {
  const getSeverityColors = (score: number, isHeatwave: boolean) => {
    if (isHeatwave) {
      if (score >= 7.5) {
        return {
          fill: "rgba(239, 68, 68, 0.12)",
          stroke: "#EF4444"
        };
      } else if (score >= 4.5) {
        return {
          fill: "rgba(245, 158, 11, 0.09)",
          stroke: "#F59E0B"
        };
      }
      return {
        fill: "rgba(245, 158, 11, 0.05)",
        stroke: "#F59E0B"
      };
    } else {
      if (score >= 7.5) {
        return {
          fill: "rgba(239, 68, 68, 0.08)",
          stroke: THEME.colors.status.critical
        };
      } else if (score >= 4.5) {
        return {
          fill: "rgba(20, 184, 166, 0.06)",
          stroke: THEME.colors.primary
        };
      }
      return {
        fill: "rgba(16, 185, 129, 0.07)",
        stroke: THEME.colors.accent
      };
    }
  };

  const blockedCoords = selectedIncident ? [
    { latitude: selectedIncident.lat - 0.005, longitude: selectedIncident.lng - 0.005 },
    { latitude: selectedIncident.lat - 0.002, longitude: selectedIncident.lng - 0.002 },
    { latitude: selectedIncident.lat, longitude: selectedIncident.lng },
    { latitude: selectedIncident.lat + 0.002, longitude: selectedIncident.lng + 0.002 },
    { latitude: selectedIncident.lat + 0.005, longitude: selectedIncident.lng + 0.005 }
  ] : [];

  const detourCoords = selectedIncident ? [
    { latitude: selectedIncident.lat - 0.005, longitude: selectedIncident.lng - 0.005 },
    { latitude: selectedIncident.lat - 0.004, longitude: selectedIncident.lng + 0.001 },
    { latitude: selectedIncident.lat - 0.001, longitude: selectedIncident.lng + 0.005 },
    { latitude: selectedIncident.lat + 0.002, longitude: selectedIncident.lng + 0.004 },
    { latitude: selectedIncident.lat + 0.005, longitude: selectedIncident.lng + 0.005 }
  ] : [];

  return (
    <>
      {incidents.map((incident) => {
        const colors = getSeverityColors(incident.severity_score, incident.disaster_type === "heatwave");
        
        // Generate a simple octagon around the incident point for the "flood zone"
        const radius = 0.005; // ~500m
        const polygonCoords = [
          { latitude: incident.lat + radius, longitude: incident.lng },
          { latitude: incident.lat + radius * 0.7, longitude: incident.lng + radius * 0.7 },
          { latitude: incident.lat, longitude: incident.lng + radius },
          { latitude: incident.lat - radius * 0.7, longitude: incident.lng + radius * 0.7 },
          { latitude: incident.lat - radius, longitude: incident.lng },
          { latitude: incident.lat - radius * 0.7, longitude: incident.lng - radius * 0.7 },
          { latitude: incident.lat, longitude: incident.lng - radius },
          { latitude: incident.lat + radius * 0.7, longitude: incident.lng - radius * 0.7 },
        ];

        return (
          <Polygon
            key={`poly-${incident.id}`}
            coordinates={polygonCoords}
            fillColor={colors.fill}
            strokeColor={colors.stroke}
            strokeWidth={1.5}
          />
        );
      })}

      {selectedIncident && (
        <>
          {/* Blocked primary route (dashed red line) */}
          <Polyline
            coordinates={blockedCoords}
            strokeColor={THEME.colors.status.critical}
            strokeWidth={4.5}
            lineDashPattern={[6, 8]}
          />

          {/* Detour open bypass route (solid green line) - visible only when active */}
          {isDetourActive && (
            <Polyline
              coordinates={detourCoords}
              strokeColor={THEME.colors.primary}
              strokeWidth={5}
            />
          )}
        </>
      )}
    </>
  );
};

export default MapOverlay;
