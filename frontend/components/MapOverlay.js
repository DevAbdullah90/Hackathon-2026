"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_maps_1 = require("react-native-maps");
var MapOverlay = function (_a) {
    var incidents = _a.incidents, route = _a.route;
    var getSeverityColor = function (severity, type) {
        if (severity >= 7.5) {
            return type === "fill" ? "rgba(220, 38, 38, 0.4)" : "rgba(220, 38, 38, 1)";
        }
        else if (severity >= 4.5) {
            return type === "fill" ? "rgba(245, 158, 11, 0.35)" : "rgba(245, 158, 11, 1)";
        }
        return type === "fill" ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 1)";
    };
    // Helper to generate a rough polygon around a point
    var generatePolygon = function (lat, lng, radiusKm) {
        var radius = (radiusKm || 0.5) / 111; // 1 degree is roughly 111km
        return [
            { latitude: lat + radius, longitude: lng - radius },
            { latitude: lat + radius, longitude: lng + radius },
            { latitude: lat - radius, longitude: lng + radius },
            { latitude: lat - radius, longitude: lng - radius },
        ];
    };
    return (<>
      {incidents.map(function (incident) { return (<react_native_maps_1.Polygon key={"poly-".concat(incident.id)} coordinates={generatePolygon(incident.lat, incident.lng, incident.affected_radius_km)} fillColor={getSeverityColor(incident.severity_score, "fill")} strokeColor={getSeverityColor(incident.severity_score, "stroke")} strokeWidth={2}/>); })}
      {route && route.length > 0 && (<react_native_maps_1.Polyline coordinates={route} strokeColor="#3B82F6" strokeWidth={4} lineDashPattern={[10, 5]}/>)}
    </>);
};
exports.default = MapOverlay;
