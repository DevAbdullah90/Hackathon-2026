"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    // Backend URL — pointed to local computer IP on Wi-Fi
    API_BASE_URL: "https://hackathon-2026-production-ff6c.up.railway.app/api/v1",
    WS_BASE_URL: "wss://hackathon-2026-production-ff6c.up.railway.app",
    GOOGLE_MAPS_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_KEY_HERE",
    // Islamabad center coordinates
    ISLAMABAD_CENTER: {
        latitude: 33.6844,
        longitude: 73.0479,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    },
    // Karachi center coordinates
    KARACHI_CENTER: {
        latitude: 24.8607,
        longitude: 67.0011,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
    },
};
