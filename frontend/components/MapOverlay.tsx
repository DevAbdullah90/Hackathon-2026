import React from "react";
import { Polygon } from "react-native-maps";
import { Incident } from "../lib/api";
import { THEME } from "../lib/theme";

interface MapOverlayProps {
  incidents: Incident[];
}

const MapOverlay: React.FC<MapOverlayProps> = ({ incidents }) => {
  const getSeverityColors = (score: number) => {
    if (score >= 7.5) {
      // Critical: Stark red alert fill with Velvet Black outline
      return {
        fill: "rgba(220, 38, 38, 0.12)",
        stroke: THEME.colors.text.primary
      };
    } else if (score >= 4.5) {
      // Elevated: Soft zinc fill with cool grey outline
      return {
        fill: "rgba(9, 9, 11, 0.05)",
        stroke: THEME.colors.text.muted
      };
    }
    // Nominal: Delicate forest green fill with branding green outline
    return {
      fill: "rgba(6, 78, 59, 0.08)",
      stroke: THEME.colors.primary
    };
  };

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
            strokeWidth={2}
          />
        );
      })}
    </>
  );
};

export default MapOverlay;
