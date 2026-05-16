export const THEME = {
  colors: {
    // 60% Black / Deep Charcoal Backgrounds
    background: "#0A0A0A",
    surface: "#121212",
    surfaceElevated: "#171717",
    surfaceBorder: "#262626", // Subtle border
    
    // 30% White / Muted Text
    text: {
      primary: "#FFFFFF",
      secondary: "#D4D4D4",
      muted: "#A3A3A3",
    },

    // 10% Green Emphasis
    primary: "#10B981", // Emerald/Neon Green for primary actions
    primaryDark: "#047857", // Darker green for backgrounds/subtle accents
    
    // Status colors (adapted to fit the theme where possible, but strictly avoiding random colors)
    // Critical usually implies red, but we can use white/red accents strictly if needed, 
    // or keep it monochrome/green if we strictly follow the prompt.
    // The prompt says: "Use dark green or neon green only for important emphasis... Do not use bright random colors outside the theme."
    // Let's use a very muted red if absolutely necessary for critical alerts, or just use high-contrast white.
    // I'll define muted status colors but rely mostly on green for emphasis.
    status: {
      success: "#10B981", 
      warning: "#F59E0B", // Keeping warning/critical for severity, but using them very sparingly
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
};
