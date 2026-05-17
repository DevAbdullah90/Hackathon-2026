export const THEME = {
  colors: {
    // Peaceful Light-Mode Backgrounds (White/Emerald Mist)
    background: "#FFFFFF",
    surface: "#F7F9F8",
    surfaceElevated: "#EDF2F0",
    surfaceBorder: "#E2EBE6", 
    glass: "rgba(255, 255, 255, 0.88)",
    glassBorder: "rgba(6, 78, 59, 0.12)",
    
    // High-End Black Typography
    text: {
      primary: "#09090B",      // Pure Velvet Black
      secondary: "#3F3F46",    // Charcoal
      muted: "#71717A",        // Cool Grey
    },

    // Premium Dark Green Branding Elements
    primary: "#064E3B",        // Deep Forest Green
    primaryDark: "#022C22",    // Obsidian Green
    accent: "#059669",         // Vibrant Emerald Accent
    
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
    heading: "Inter_900Black",
    subheading: "Inter_700Bold",
    body: "Inter_400Regular",
    mono: "JetBrainsMono_400Regular",
  },
  shadows: {
    glow: {
      shadowColor: "#064E3B",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 5,
    },
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 3,
    }
  }
};
