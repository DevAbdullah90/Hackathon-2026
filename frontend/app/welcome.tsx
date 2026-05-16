import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Animated,
  Dimensions
} from "react-native";
import { THEME } from "../lib/theme";
import { ShieldAlert, ArrowRight, Activity, Globe } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }: any) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Decorative Grid Background */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: i * 40 }]} />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 40 }]} />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.headerArea}>
            <View style={styles.badge}>
              <Activity size={12} color={THEME.colors.primary} />
              <Text style={styles.badgeText}>SECURE CONNECTION</Text>
            </View>
          </View>

          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Globe size={48} color={THEME.colors.text.primary} strokeWidth={1} />
            </View>
            <Text style={styles.title}>CIRO</Text>
            <Text style={styles.subtitle}>COMMAND & CONTROL</Text>
            
            <Text style={styles.description}>
              Cognitive Incident Response Orchestrator. 
              Real-time multi-agent crisis management and 
              infrastructure rerouting system.
            </Text>
          </View>

          <View style={styles.footerArea}>
            <View style={styles.systemStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ALL SYSTEMS NOMINAL</Text>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.replace("Dashboard")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>INITIALIZE</Text>
              <ArrowRight size={20} color={THEME.colors.background} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: THEME.colors.text.muted,
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: THEME.colors.text.muted,
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
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
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
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.xl,
  },
  title: {
    color: THEME.colors.text.primary,
    fontSize: 48,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 4,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    color: THEME.colors.text.muted,
    fontSize: 14,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 4,
    marginBottom: THEME.spacing.xl,
  },
  description: {
    color: THEME.colors.text.secondary,
    fontSize: 14,
    fontFamily: THEME.fonts.body,
    lineHeight: 24,
    maxWidth: "80%",
  },
  footerArea: {
    marginBottom: THEME.spacing.xl,
  },
  systemStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1.5,
  },
  primaryButton: {
    backgroundColor: THEME.colors.primary,
    height: 64,
    borderRadius: THEME.borderRadius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.xl,
  },
  primaryButtonText: {
    color: THEME.colors.background,
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
});
