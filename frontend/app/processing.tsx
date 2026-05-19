import React, { useEffect, useState } from "react";
import { View,
  Text,
  StyleSheet,
  
  StatusBar,
  ActivityIndicator,
  TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence
} from "react-native-reanimated";
import { THEME } from "../lib/theme";
import { api, PipelineStatus } from "../lib/api";
import LiveLogStream from "../components/LiveLogStream";
import AtmosphericBackground from "../components/AtmosphericBackground";
import { Cpu, ShieldCheck, AlertCircle, Play, ChevronRight } from "lucide-react-native";

interface ProcessingScreenProps {
  route: {
    params: {
      signalId: string;
    };
  };
  navigation: any;
}

const STAGES = [
  { key: "raw_signal", label: "Signal Ingested", desc: "Telemetry captured in buffer" },
  { key: "detection_agent", label: "Triage Specialist", desc: "Agent verifying signal veracity" },
  { key: "severity_agent", label: "Severity Specialist", desc: "Estimating impact and assets" },
  { key: "notification_agent", label: "Response Specialist", desc: "Dispatching units and alerts" }
];

export default function ProcessingScreen({ route, navigation }: ProcessingScreenProps) {
  const { signalId } = route.params;
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Animated pulse for loading status glow
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value
  }));

  // Polling loop
  useEffect(() => {
    let active = true;
    let pollInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        console.log(`🌀 [ProcessingScreen] Polling pipeline status for signal: ${signalId}`);
        const status = await api.getPipelineStatus(signalId);
        
        if (!active) return;
        setPipeline(status);

        // Check if finished successfully
        if (status.status === "CONFIRMED" && status.incident_id) {
          console.log(`✅ [ProcessingScreen] Signal confirmed! Redirecting to Incident: ${status.incident_id}`);
          clearInterval(pollInterval);
          
          // Delayed transition for smooth visual feedback
          setTimeout(() => {
            if (active) {
              navigation.replace("Reasoning", {
                incidentId: status.incident_id,
                location: status.message || "Confirmed Incident Location"
              });
            }
          }, 1500);
        } else if (status.status === "REJECTED") {
          console.log(`❌ [ProcessingScreen] Signal was rejected.`);
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error("❌ Error polling status:", err);
        setError(err.message || "Failed to communicate with multi-agent pipeline.");
      }
    };

    pollStatus(); // initial call
    pollInterval = setInterval(pollStatus, 1500); // 1.5s interval

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [signalId]);

  // Determine which step is currently active
  const getActiveStepIndex = () => {
    if (!pipeline) return 0;
    const currentKey = pipeline.stage.toLowerCase();
    const idx = STAGES.findIndex(s => currentKey.includes(s.key));
    return idx === -1 ? 0 : idx;
  };

  const activeIndex = getActiveStepIndex();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AtmosphericBackground />

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>COGNITIVE TRIAGE</Text>
          <Text style={styles.headerSubtitle}>Multi-Agent Verification Pipeline</Text>
        </View>
        <View style={styles.signalBadge}>
          <Text style={styles.signalIdText}>{signalId.substring(0, 10).toUpperCase()}</Text>
        </View>
      </View>

      {/* Main Glass Center Card */}
      <Animated.View entering={FadeInUp.springify()} style={styles.mainCardWrapper}>
        <View style={styles.mainCard}>
          
          {/* Animated Glow Circle */}
          <View style={styles.loaderContainer}>
            <Animated.View style={[styles.glowRing, glowStyle, {
              borderColor: pipeline?.status === "CONFIRMED" ? "#10B981" : THEME.colors.primary
            }]} />
            <View style={[styles.centerRing, {
              backgroundColor: pipeline?.status === "CONFIRMED" ? "rgba(16, 185, 129, 0.1)" : "rgba(37, 99, 235, 0.1)"
            }]}>
              {pipeline?.status === "CONFIRMED" ? (
                <ShieldCheck size={36} color="#10B981" />
              ) : (
                <Cpu size={36} color={THEME.colors.primary} />
              )}
            </View>
          </View>

          {/* Stepper Steps */}
          <View style={styles.stepperContainer}>
            {STAGES.map((stage, i) => {
              const isCompleted = i < activeIndex || pipeline?.status === "CONFIRMED";
              const isActive = i === activeIndex && pipeline?.status !== "CONFIRMED";
              
              return (
                <View key={stage.key} style={styles.stepRow}>
                  {/* Step Dot & Connector Line */}
                  <View style={styles.stepLeft}>
                    <View style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isActive && styles.stepDotActive
                    ]}>
                      {isCompleted && <View style={styles.innerCheckDot} />}
                    </View>
                    {i < STAGES.length - 1 && (
                      <View style={[
                        styles.connectorLine,
                        isCompleted && styles.connectorLineCompleted
                      ]} />
                    )}
                  </View>
 
                  {/* Step Text Info */}
                  <View style={styles.stepInfo}>
                    <Text style={[
                      styles.stepLabel,
                      (isActive || isCompleted) && styles.stepLabelActive
                    ]}>
                      {stage.label}
                    </Text>
                    <Text style={styles.stepDesc}>{stage.desc}</Text>
                  </View>

                  {/* Running Loader Badge */}
                  {isActive && (
                    <ActivityIndicator size="small" color={THEME.colors.primary} />
                  )}
                </View>
              );
            })}
          </View>

        </View>
      </Animated.View>

      {/* Specialist Logs Pane */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.logsWrapper}>
        <Text style={styles.logsSectionTitle}>LOG CORRELATION PIPELINE</Text>
        <View style={styles.logsPane}>
          <LiveLogStream incidentId={`triage_${signalId}`} />
        </View>
      </Animated.View>

      {/* Discarded or Error Return Navigation */}
      {pipeline?.status === "REJECTED" && (
        <Animated.View entering={FadeInUp} style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <AlertCircle size={44} color="#EF4444" style={{ marginBottom: 12 }} />
            <Text style={styles.errorTitle}>Signal Discarded</Text>
            <Text style={styles.errorText}>
              The Multi-Agent specialist network evaluated this telemetry and rejected it as non-crisis duplicate or anomaly noise.
            </Text>
            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
              <Text style={styles.returnButtonText}>Back to Tactical Map</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {error && (
        <Animated.View entering={FadeInUp} style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <AlertCircle size={44} color="#EF4444" style={{ marginBottom: 12 }} />
            <Text style={styles.errorTitle}>Network Alert</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
              <Text style={styles.returnButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: THEME.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: THEME.fonts.body,
    color: THEME.colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  signalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.surfaceSoft,
  },
  signalIdText: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
  },
  mainCardWrapper: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
  },
  mainCard: {
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.surface,
    ...THEME.shadows.card,
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    marginBottom: THEME.spacing.md,
  },
  glowRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  centerRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14, 165, 233, 0.1)",
  },
  stepperContainer: {
    marginTop: THEME.spacing.sm,
  },
  stepRow: {
    flexDirection: "row",
    height: 52,
    alignItems: "flex-start",
  },
  stepLeft: {
    alignItems: "center",
    width: 24,
    marginRight: 16,
    height: "100%",
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.surface,
    zIndex: 2,
  },
  stepDotActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.surface,
    transform: [{ scale: 1.2 }],
  },
  stepDotCompleted: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.accent,
  },
  innerCheckDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.surface,
    alignSelf: "center",
    marginTop: 3,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: THEME.colors.surfaceBorder,
    zIndex: 1,
  },
  connectorLineCompleted: {
    backgroundColor: THEME.colors.accent,
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: THEME.fonts.subheading,
    fontWeight: "700",
    color: THEME.colors.text.muted,
  },
  stepLabelActive: {
    color: THEME.colors.text.primary,
  },
  stepDesc: {
    fontSize: 10,
    fontFamily: THEME.fonts.body,
    color: THEME.colors.text.secondary,
    marginTop: 1,
  },
  logsWrapper: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.lg,
  },
  logsSectionTitle: {
    fontSize: 11,
    fontFamily: THEME.fonts.heading,
    fontWeight: "bold",
    letterSpacing: 1,
    color: THEME.colors.text.muted,
    marginBottom: 6,
  },
  logsPane: {
    flex: 1,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    backgroundColor: THEME.colors.surface,
    overflow: "hidden",
    ...THEME.shadows.card,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: THEME.spacing.xl,
    zIndex: 10,
  },
  errorCard: {
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 110, 0.25)",
    padding: THEME.spacing.xl,
    width: "100%",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    ...THEME.shadows.card,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: THEME.fonts.subheading,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: THEME.colors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  returnButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.sm,
    ...THEME.shadows.card,
  },
  returnButtonText: {
    color: "#FFFFFF",
    fontFamily: THEME.fonts.subheading,
    fontWeight: "bold",
    fontSize: 13,
  }
});
