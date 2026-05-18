import { Platform } from "react-native";

export const THEME = {
  colors: {
    // Peaceful Light-Mode Backgrounds (White/Sage Mist)
    background: "#FFFFFF",
    surface: "#F8FAF8",
    surfaceElevated: "#EFF4F0",
    surfaceBorder: "#DCE7E0",
    glass: "rgba(255, 255, 255, 0.94)",
    glassBorder: "rgba(6, 78, 59, 0.08)",
    surfaceSoft: "#F2F8F4",
    surfaceWarm: "#FAFBF8",
    
    // High-End Black Typography
    text: {
      primary: "#09090B",      // Pure Velvet Black
      secondary: "#3F3F46",    // Charcoal
      muted: "#71717A",        // Cool Grey
    },

    // Premium Light Green Branding Elements
    primary: "#0F766E",        // Deep teal-green
    primaryDark: "#115E59",    // Darker teal
    accent: "#10B981",         // Emerald Accent
    accentSoft: "#DDF7EE",
    
    status: {
      success: "#059669", 
      warning: "#D97706", 
      critical: "#DC2626", 
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fonts: {
    heading: Platform.select({ ios: "System", android: "Roboto", default: "System" }),
    subheading: Platform.select({ ios: "System", android: "Roboto", default: "System" }),
    body: Platform.select({ ios: "System", android: "Roboto", default: "System" }),
    mono: Platform.select({ ios: "monospace", android: "monospace", default: "monospace" }),
  },
  shadows: {
    glow: {
      shadowColor: "#0F766E",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 4,
    },
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.04,
      shadowRadius: 18,
      elevation: 2,
    }
  }
};
