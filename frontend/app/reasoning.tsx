import React, { useEffect, useState } from "react";
import { View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
   
  StatusBar,
  ScrollView,
  ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtmosphericBackground from "../components/AtmosphericBackground";
import LiveLogStream from "../components/LiveLogStream";
import { THEME } from "../lib/theme";
import { api, ChainOfThought, Action } from "../lib/api";
import { 
  ChevronLeft, 
  Cpu, 
  Play,
  Layers,
  Terminal,
  Brain,
  Activity,
  CheckCircle2,
} from "lucide-react-native";

export default function ReasoningCenter({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "DEMO-001", location: "Active Sector" };
  const [agentsActive, setAgentsActive] = useState(["ORCHESTRATOR", "GEOSPATIAL", "LOGISTICS"]);
  const [cotSteps, setCotSteps] = useState<ChainOfThought[]>([]);
  const [loadingCot, setLoadingCot] = useState(true);

  const [actions, setActions] = useState<Action[]>([]);
  const [loadingActions, setLoadingActions] = useState(true);

  const fetchCot = async () => {
    try {
      setLoadingCot(true);
      const data = await api.getChainOfThought(incidentId);
      setCotSteps(data);
    } catch (err) {
      console.warn("Failed to fetch CoT steps:", err);
    } finally {
      setLoadingCot(false);
    }
  };

  const fetchActions = async () => {
    try {
      setLoadingActions(true);
      const data = await api.getSimulationState(incidentId);
      setActions(data);
      const completedCount = data.filter(a => a.status.toUpperCase() === "COMPLETED").length;
      const allCompleted = data.length > 0 && completedCount === data.length;
      if (allCompleted) {
        navigation.replace("Outcome", { incidentId, location });
      } else {
        navigation.replace("Simulation", { incidentId, location });
      }
    } catch (err) {
      console.warn("Failed to fetch simulation actions:", err);
    } finally {
      setLoadingActions(false);
    }
  };

  useEffect(() => {
    fetchCot();
    fetchActions();

    // Add navigation focus listener to re-fetch actions when returning to this screen
    const unsubscribe = navigation.addListener("focus", () => {
      fetchActions();
    });

    return unsubscribe;
  }, [incidentId, navigation]);

  const getButtonConfig = () => {
    if (loadingActions) {
      return {
        text: "LOADING ACTIONS...",
        icon: <ActivityIndicator size="small" color={THEME.colors.text.muted} />,
        disabled: true,
        targetScreen: "Simulation",
      };
    }

    if (!actions || actions.length === 0) {
      return {
        text: "AWAITING ACTIONS...",
        icon: <ActivityIndicator size="small" color={THEME.colors.text.muted} />,
        disabled: true,
        targetScreen: "Simulation",
      };
    }

    const completedCount = actions.filter(a => a.status.toUpperCase() === "COMPLETED").length;
    const isStarted = actions.some(a => ["ACTIVE", "RUNNING", "COMPLETED", "SENT", "ON_SITE"].includes(a.status.toUpperCase()));
    const allCompleted = actions.length > 0 && completedCount === actions.length;

    if (allCompleted) {
      return {
        text: "VIEW COMPLETED DISPATCH",
        icon: <CheckCircle2 size={16} color={THEME.colors.primary} />,
        disabled: false,
        targetScreen: "Outcome",
      };
    }

    if (isStarted) {
      return {
        text: "MONITOR RESPONSE",
        icon: <Activity size={16} color={THEME.colors.primary} />,
        disabled: false,
        targetScreen: "Simulation",
      };
    }

    return {
      text: "INITIATE SIMULATION",
      icon: <Play size={16} color={THEME.colors.primary} fill={THEME.colors.primary} />,
      disabled: false,
      targetScreen: "Simulation",
    };
  };

  if (loadingActions) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
        <View style={StyleSheet.absoluteFill}>
          <AtmosphericBackground />
        </View>
        <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="small" color={THEME.colors.primary} />
          <Text style={{
            color: THEME.colors.text.primary,
            fontFamily: THEME.fonts.mono,
            fontSize: 10,
            letterSpacing: 2,
            marginTop: 16
          }}>
            RETRIEVING MISSION INTEL...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  const buttonConfig = getButtonConfig();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      <View style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </View>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Mission Header */}
        <View>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={20} color={THEME.colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerLabel}>MISSION ANALYSIS</Text>
              <Text style={styles.headerTitle}>{location}</Text>
            </View>
            <View style={styles.missionId}>
              <Text style={styles.missionIdText} numberOfLines={1}>
                {incidentId ? incidentId.slice(0, 8).toUpperCase() + "..." : "MISSION"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: THEME.spacing.lg }}
        >
          {/* Agent Status Grid */}
          <View style={styles.agentGrid}>
            {agentsActive.map((agent, index) => (
              <View key={agent} style={styles.agentCardContainer}>
                <View style={styles.agentCard}>
                  <View style={styles.agentIconContainer}>
                    {index === 0 ? <Cpu size={16} color={THEME.colors.primary} /> : <Layers size={16} color={THEME.colors.text.primary} />}
                  </View>
                  <Text style={styles.agentName}>{agent}</Text>
                  <View style={styles.agentStatusRow}>
                    <View style={styles.agentStatusDot} />
                    <Text style={styles.agentStatus}>ONLINE</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Reasoning Console */}
          <View style={styles.consoleHeader}>
            <View style={styles.consoleTitleRow}>
              <Terminal size={14} color={THEME.colors.text.muted} />
              <Text style={styles.consoleTitle}>AI LOGSTREAM</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.logContainerContainer}>
            <View style={styles.logContainer}>
              <LiveLogStream incidentId={incidentId} />
            </View>
          </View>

          {/* Strategy Summary / Chain of Thought Traces */}
          <View style={styles.strategyCardContainer}>
            <View style={styles.strategyCard}>
              <View style={styles.strategyHeader}>
                <Brain size={16} color={THEME.colors.primary} />
                <Text style={styles.strategyTitle}>CHAIN OF THOUGHT TRACES</Text>
              </View>
              
              {loadingCot ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color={THEME.colors.primary} />
                  <Text style={styles.loadingText}>FETCHING AGENT REASONING...</Text>
                </View>
              ) : cotSteps.length === 0 ? (
                <Text style={styles.strategyText}>
                  Listening for deep-dive cognitive chain-of-thought traces. Confirming flood signal validation...
                </Text>
              ) : (
                <View style={styles.cotTimeline}>
                  {cotSteps.map((step, idx) => (
                    <View
                      key={step.id || idx}
                      style={[
                        styles.cotStepContainer,
                        idx === cotSteps.length - 1 ? styles.lastCotStep : null
                      ]}
                    >
                      <View style={styles.cotIndicator}>
                        <View style={styles.cotDot} />
                        {idx < cotSteps.length - 1 && <View style={styles.cotLine} />}
                      </View>
                      
                      <View style={styles.cotContent}>
                        <Text style={styles.cotAgentHeader}>
                          🤖 {step.agent_name.toUpperCase()} (CoT Trace)
                        </Text>
                        <Text style={styles.cotText}>
                          {step.cot_steps}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Action Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.simulationButton, buttonConfig.disabled && styles.disabledButton]}
            onPress={() => !buttonConfig.disabled && navigation.navigate(buttonConfig.targetScreen || "Simulation", { incidentId, location })}
            activeOpacity={buttonConfig.disabled ? 1 : 0.8}
            disabled={buttonConfig.disabled}
          >
            {buttonConfig.icon}
            <Text style={[styles.simulationButtonText, buttonConfig.disabled && styles.disabledButtonText]}>
              {buttonConfig.text}
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xl,
    backgroundColor: THEME.colors.surface,
    gap: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.card,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surfaceSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  headerInfo: {
    flex: 1,
  },
  headerLabel: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    marginBottom: 4,
    fontWeight: "700",
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 20,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  missionId: {
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.2)",
  },
  missionIdText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
  },
  agentGrid: {
    flexDirection: "row",
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  agentCardContainer: {
    flex: 1,
    borderRadius: THEME.borderRadius.xl,
    overflow: "hidden",
    ...THEME.shadows.card,
  },
  agentCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: "center",
    borderRadius: THEME.borderRadius.xl,
  },
  agentIconContainer: {
    marginBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.surfaceSoft,
    padding: 10,
    borderRadius: 12,
  },
  agentName: {
    color: THEME.colors.text.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.heading,
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: "800",
  },
  agentStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  agentStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.status.success,
  },
  agentStatus: {
    color: THEME.colors.status.success,
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
    fontWeight: "800",
  },
  consoleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  },
  consoleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  consoleTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    fontWeight: "900",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
  },
  liveText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  logContainerContainer: {
    borderRadius: THEME.borderRadius.xxl,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.premium,
  },
  logContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.sm,
    height: 320,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
  },
  strategyCardContainer: {
    borderRadius: THEME.borderRadius.xxl,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.premium,
  },
  strategyCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
  },
  strategyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: THEME.spacing.xl,
  },
  strategyTitle: {
    color: THEME.colors.text.primary,
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
    fontWeight: "900",
  },
  strategyText: {
    color: THEME.colors.text.secondary,
    fontSize: 13,
    fontFamily: THEME.fonts.mono,
    lineHeight: 22,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.lg,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  simulationButton: {
    backgroundColor: THEME.colors.primary,
    height: 64,
    borderRadius: THEME.borderRadius.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    ...THEME.shadows.premium,
  },
  simulationButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 2,
  },
  loaderContainer: {
    paddingVertical: THEME.spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: THEME.spacing.sm,
  },
  loadingText: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
    fontWeight: "700",
  },
  cotTimeline: {
    marginTop: THEME.spacing.md,
  },
  cotStepContainer: {
    flexDirection: "row",
    gap: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  lastCotStep: {
    marginBottom: 0,
  },
  cotIndicator: {
    alignItems: "center",
    width: 20,
  },
  cotDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.primary,
    marginTop: 6,
    ...THEME.shadows.glow,
  },
  cotLine: {
    width: 2,
    flex: 1,
    backgroundColor: THEME.colors.primary,
    opacity: 0.1,
    marginTop: 6,
  },
  cotContent: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
  },
  cotAgentHeader: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.md,
    fontWeight: "900",
  },
  cotText: {
    color: THEME.colors.text.secondary,
    fontSize: 12,
    fontFamily: THEME.fonts.body,
    lineHeight: 20,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: THEME.colors.surface,
  },
  disabledButtonText: {
    color: THEME.colors.text.muted,
  },
});
