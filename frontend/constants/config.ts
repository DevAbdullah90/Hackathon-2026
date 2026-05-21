import Constants from "expo-constants";

// Dynamically extract the Metro Bundler host IP address (e.g. 192.168.1.6)
const getDevMachineIp = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || "";
  if (hostUri) {
    return hostUri.split(":")[0];
  }
  return "localhost"; // Fallback
};

const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;
const devIp = getDevMachineIp();

const PROD_API_BASE = "https://hackathon-2026-production-ff6c.up.railway.app";
const PROD_WS_BASE = "wss://hackathon-2026-production-ff6c.up.railway.app";

export const CONFIG = {
  API_BASE_URL: isDev ? `http://${devIp}:8000` : PROD_API_BASE,
  WS_BASE_URL: isDev ? `ws://${devIp}:8000` : PROD_WS_BASE,

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
