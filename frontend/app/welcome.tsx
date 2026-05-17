import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar,
  Dimensions
} from "react-native";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  ZoomIn,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  useAnimatedStyle
} from "react-native-reanimated";
import { THEME } from "../lib/theme";
import { Shield } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }: any) {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Elegant breathing micro-animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 })
      ),
      -1,
      true
    );

    // Automated 2.2-second transition to Dashboard
    const timer = setTimeout(() => {
      navigation.replace("Dashboard");
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: pulseScale.value * 1.3 }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
      
      {/* Centered Brand Presentation */}
      <View style={styles.centerArea}>
        {/* Glowing Logo Aura */}
        <Animated.View style={[styles.logoGlow, animatedGlowStyle]} />

        {/* Minimalist White Logo */}
        <Animated.View entering={ZoomIn.duration(800).springify()} style={[styles.logoContainer, animatedLogoStyle]}>
          <Shield size={64} color="#FFFFFF" strokeWidth={1.5} />
        </Animated.View>

        {/* Premium Typography */}
        <Animated.Text entering={FadeInDown.delay(300).duration(600)} style={styles.title}>
          CIRO
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(550).duration(600)} style={styles.subtitle}>
          CRISIS INTEL & ORCHESTRATION
        </Animated.Text>
      </View>

      {/* System Status Loading Indicator */}
      <Animated.View entering={FadeIn.delay(800).duration(1000)} style={styles.loaderArea}>
        <View style={styles.spinner} />
        <Text style={styles.loaderText}>INITIALIZING COGNITIVE ENGINE...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.primary, // Solid premium deep green `#064E3B`
    justifyContent: "center",
    alignItems: "center",
  },
  centerArea: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: THEME.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.24)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 2,
  },
  logoGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    zIndex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 48,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 8,
    marginTop: THEME.spacing.xl,
    fontWeight: "900",
    textShadowColor: "rgba(255, 255, 255, 0.2)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 4,
    marginTop: THEME.spacing.sm,
    textAlign: "center",
  },
  loaderArea: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
    gap: THEME.spacing.sm,
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderTopColor: "#FFFFFF",
  },
  loaderText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
  },
});
