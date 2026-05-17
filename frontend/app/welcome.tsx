import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from "react-native";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  ZoomIn,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  useAnimatedStyle
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import AtmosphericBackground from "../components/AtmosphericBackground";
import { THEME } from "../lib/theme";
import { ShieldAlert, ArrowRight, Activity, Globe } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }: any) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    shadowOpacity: pulseScale.value * 0.5,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Cinematic Background */}
      <Animated.View entering={FadeIn.duration(2000)} style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.headerArea}>
            <BlurView intensity={20} tint="light" style={styles.badge}>
              <Activity size={12} color={THEME.colors.primary} />
              <Text style={styles.badgeText}>SECURE CONNECTION</Text>
            </BlurView>
          </Animated.View>

          <View style={styles.heroSection}>
            <Animated.View entering={ZoomIn.delay(400).springify()} style={{ marginBottom: THEME.spacing.xl }}>
              <BlurView intensity={40} tint="light" style={styles.logoContainer}>
                <Globe size={48} color={THEME.colors.text.primary} strokeWidth={1} />
              </BlurView>
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(500).springify()} style={styles.title}>CIRO</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(600).springify()} style={styles.subtitle}>COMMAND & CONTROL</Animated.Text>
            
            <Animated.Text entering={FadeInDown.delay(700).springify()} style={styles.description}>
              Cognitive Incident Response Orchestrator. 
              Real-time multi-agent crisis management and 
              infrastructure rerouting system.
            </Animated.Text>
          </View>

          <Animated.View entering={FadeInUp.delay(900).springify()} style={styles.footerArea}>
            <View style={styles.systemStatus}>
              <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseScale.value }] }]} />
              <Text style={styles.statusText}>ALL SYSTEMS NOMINAL</Text>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.replace("Dashboard")}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.primaryButton, animatedButtonStyle]}>
                <Text style={styles.primaryButtonText}>INITIALIZE</Text>
                <ArrowRight size={20} color={THEME.colors.background} />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: THEME.spacing.xl,
    justifyContent: "space-between",
  },
  headerArea: {
    alignItems: "flex-start",
    marginTop: THEME.spacing.lg,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary + "40",
    overflow: "hidden",
    gap: 6,
  },
  badgeText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  title: {
    color: THEME.colors.text.primary,
    fontSize: 56,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 6,
    marginBottom: THEME.spacing.xs,
    textShadowColor: THEME.colors.accent + "80",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 6,
    marginBottom: THEME.spacing.xl,
  },
  description: {
    color: THEME.colors.text.secondary,
    fontSize: 15,
    fontFamily: THEME.fonts.body,
    lineHeight: 26,
    maxWidth: "85%",
  },
  footerArea: {
    marginBottom: THEME.spacing.xl,
  },
  systemStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  statusText: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
  },
  primaryButton: {
    backgroundColor: THEME.colors.primary,
    height: 64,
    borderRadius: THEME.borderRadius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.xl,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: THEME.colors.background,
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
});
