import Constants from "expo-constants";

// Dynamically extract the Metro Bundler host IP address (e.g. 192.168.1.6)
const getDevMachineIp = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || "";
  if (hostUri) {
    return hostUri.split(":")[0];
  }
  return "localhost"; // Fallback
};

const devIp = getDevMachineIp();

export const CONFIG = {
  // Backend URL — dynamically resolved to local computer IP on active Wi-Fi
  API_BASE_URL: `http://${devIp}:8000`,
  WS_BASE_URL: `ws://${devIp}:8000`,

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