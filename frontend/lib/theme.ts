export const THEME = {
  colors: {
    // 60% Black / Deep Charcoal Backgrounds
    background: "#050505",
    surface: "#0D0D0D",
    surfaceElevated: "#141414",
    surfaceBorder: "#222222", 
    glass: "rgba(20, 20, 20, 0.6)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
    
    // 30% White / Muted Text
    text: {
      primary: "#FFFFFF",
      secondary: "#A1A1AA", // Zinc 400
      muted: "#52525B", // Zinc 600
    },

    // 10% Green Emphasis
    primary: "#00E676", // Neon Green for active/confirmed action
    primaryDark: "#004D40", 
    accent: "#00FF9D", // Glow color
    
    status: {
      success: "#00E676", 
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
      shadowColor: "#00FF9D",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 10,
    },
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 5,
    }
  }
};
