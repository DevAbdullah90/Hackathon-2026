import React from "react";
import { Polygon, Polyline } from "react-native-maps";
import { Incident } from "../lib/api";
import { THEME } from "../lib/theme";

interface MapOverlayProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
}

const MapOverlay: React.FC<MapOverlayProps> = ({ incidents, selectedIncident }) => {
  const getSeverityColors = (score: number) => {
    if (score >= 7.5) {
      return {
        fill: "rgba(220, 38, 38, 0.08)",
        stroke: THEME.colors.status.critical
      };
    } else if (score >= 4.5) {
      return {
        fill: "rgba(15, 118, 110, 0.06)",
        stroke: THEME.colors.primary
      };
    }
    return {
      fill: "rgba(16, 185, 129, 0.07)",
      stroke: THEME.colors.primary
    };
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
        const colors = getSeverityColors(incident.severity_score);
        
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

          {/* Detour open bypass route (solid green line) */}
          <Polyline
            coordinates={detourCoords}
            strokeColor={THEME.colors.primary}
            strokeWidth={5}
          />
        </>
      )}
    </>
  );
};

export default MapOverlay;
