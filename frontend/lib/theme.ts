import { Platform } from "react-native";

export const THEME = {
  colors: {
    // Premium Light-Mode Backgrounds (Warm Gray/White)
    background: "#F8F9FA",        // Clean off-white
    surface: "#FFFFFF",           // Pure White
    surfaceElevated: "#FFFFFF",   // Pure White for cards
    surfaceBorder: "#F1F5F9",     // Even softer gray border (Slate 100)
    glass: "rgba(255, 255, 255, 0.9)",
    glassBorder: "rgba(0, 0, 0, 0.03)",
    surfaceSoft: "#F4F4F5",       // Light Zinc
    surfaceWarm: "#F1F3F2",       // Warm off-white
    
    // High-Contrast Carbon Typography
    text: {
      primary: "#0F172A",         // Slate 900 (Deeper for bold headers)
      secondary: "#475569",       // Slate 600
      muted: "#94A3B8",           // Slate 400
    },

    // Premium Branding Elements
    primary: "#0EA5E9",           // Sky Blue (Modern & Clean)
    primaryDark: "#0284C7",       // Sky Blue 700
    accent: "#6366F1",            // Indigo Accent
    accentSoft: "rgba(99, 102, 241, 0.08)",
    
    status: {
      success: "#10B981", 
      warning: "#F59E0B", 
      critical: "#EF4444", 
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
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
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
      shadowColor: "#0EA5E9",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
      elevation: 2,
    },
    premium: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.06,
      shadowRadius: 24,
      elevation: 4,
    }
  }
};
