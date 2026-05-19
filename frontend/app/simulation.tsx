import React, { useEffect, useState } from "react";
import { View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
   
  StatusBar, 
  ScrollView, 
  ActivityIndicator, 
  Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtmosphericBackground from "../components/AtmosphericBackground";
import ExecutionTimeline from "../components/ExecutionTimeline";
import { api, Action } from "../lib/api";
import { THEME } from "../lib/theme";
import { 
  ChevronLeft, 
  Activity, 
  Shield, 
  Rocket, 
  Zap,
  CheckCircle2
} from "lucide-react-native";

export default function SimView({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" };
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [isSimulatingLocally, setIsSimulatingLocally] = useState(false);

  const fetchSimulationState = async () => {
    if (isSimulatingLocally) return;
    const data = await api.getSimulationState(incidentId);
    setActions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSimulationState();

    const interval = setInterval(fetchSimulationState, 3000);
    return () => clearInterval(interval);
  }, [incidentId, isSimulatingLocally]);

  const handleTriggerSim = async () => {
    setTriggering(true);
    const success = await api.triggerSimulation(incidentId);
    setTriggering(false);
    
    if (success) {
      Alert.alert("SIMULATION ENGAGED", "Orchestrator has begun execution of the response plan.");
      
      // If we are serving fallback/mock actions, play a gorgeous local step-by-step simulation!
      if (actions.length > 0 && actions[0].id.startsWith("a")) {
        setIsSimulatingLocally(true);
        
        // Step 1: Set action 1 to running
        setTimeout(() => {
          setActions(prev => {
            let next = [...prev];
            if (next[0]) next[0] = { ...next[0], status: "ACTIVE" };
            return next;
          });
        }, 1000);
        
        // Step 2: Set action 1 to completed, action 2 to running
        setTimeout(() => {
          setActions(prev => {
            let next = [...prev];
            if (next[0]) next[0] = { ...next[0], status: "COMPLETED" };
            if (next[1]) next[1] = { ...next[1], status: "ACTIVE" };
            return next;
          });
        }, 4000);
        
        // Step 3: Set action 2 to completed, action 3 to running
        setTimeout(() => {
          setActions(prev => {
            let next = [...prev];
            if (next[1]) next[1] = { ...next[1], status: "COMPLETED" };
            if (next[2]) next[2] = { ...next[2], status: "ACTIVE" };
            return next;
          });
        }, 7000);
        
        // Step 4: Set action 3 to completed
        setTimeout(() => {
          setActions(prev => {
            let next = [...prev];
            if (next[2]) next[2] = { ...next[2], status: "COMPLETED" };
            return next;
          });
        }, 10000);
      }
    } else {
      Alert.alert("ERROR", "Failed to initiate simulation sequence.");
    }
  };

  const completedCount = actions.filter(a => a.status.toUpperCase() === "COMPLETED").length;
  const allCompleted = actions.length > 0 && completedCount === actions.length;
  const isRunning = actions.some(a => ["SENT", "ACTIVE", "ON_SITE", "RUNNING"].includes(a.status.toUpperCase()));
  const isStarted = actions.some(a => ["ACTIVE", "RUNNING", "COMPLETED", "SENT", "ON_SITE"].includes(a.status.toUpperCase()));


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      <View style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </View>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={20} color={THEME.colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerLabel}>ACTION SIMULATOR</Text>
              <Text style={styles.headerTitle}>{location}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {completedCount}/{actions.length || 0} DONE
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View style={styles.summaryCardContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.iconCircle}>
                  <Shield size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.summaryTitle}>OPERATIONAL PLAN ALPHA</Text>
                  <Text style={styles.summarySubtitle}>Multi-agent synchronized response</Text>
                </View>
              </View>
              
              <Text style={styles.summaryText}>
                CIRO is executing a high-precision response strategy. Assets are being deployed 
                and infrastructure is being rerouted based on real-time data projections.
              </Text>
              
              {actions.length > 0 && !loading && !isStarted && (
                <TouchableOpacity 
                  style={[styles.triggerButton, triggering && styles.disabledButton]} 
                  onPress={handleTriggerSim}
                  disabled={triggering}
                >
                  {triggering ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Rocket size={16} color="#FFFFFF" />
                      <Text style={styles.triggerButtonText}>ACTIVATE SEQUENCE</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {actions.length > 0 && !loading && isStarted && !allCompleted && (
                <View style={styles.activeStatusCard}>
                  <Activity size={14} color={THEME.colors.primary} />
                  <Text style={styles.activeStatusText}>RESPONSE SWARM ACTIVE — DISPATCH IN PROGRESS</Text>
                </View>
              )}

              {actions.length > 0 && !loading && allCompleted && (
                <View style={[styles.activeStatusCard, styles.completedStatusCard]}>
                  <CheckCircle2 size={14} color={THEME.colors.primary} />
                  <Text style={styles.completedStatusText}>SWARM DISPATCH COMPLETED SUCCESSFUL</Text>
                </View>
              )}
            </View>
          </View>

          {/* Timeline Section */}
          <View style={styles.timelineSection}>
            <View style={styles.sectionHeader}>
              <Activity size={16} color={THEME.colors.text.muted} />
              <Text style={styles.sectionTitle}>EXECUTION TIMELINE</Text>
            </View>
            
            {loading ? (
              <ActivityIndicator color={THEME.colors.text.primary} style={{ marginTop: 40 }} />
            ) : actions.length > 0 ? (
              <ExecutionTimeline actions={actions} />
            ) : (
              <View style={styles.emptyState}>
                <Zap size={24} color={THEME.colors.text.muted} strokeWidth={1.5} />
                <Text style={styles.emptyText}>Waiting for orchestration sequence...</Text>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Success Footer */}
        {allCompleted && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.outcomeButton}
              onPress={() => navigation.navigate("Outcome", { incidentId, location })}
            >
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.outcomeButtonText}>ANALYZE FINAL IMPACT</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerTitleContainer: {
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
  },
  statusBadge: {
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.2)",
  },
  statusBadgeText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "900",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
  },
  summaryCardContainer: {
    borderRadius: THEME.borderRadius.xxl,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.premium,
  },
  summaryCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...THEME.shadows.glow,
  },
  summaryTitle: {
    color: THEME.colors.text.primary,
    fontSize: 16,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
    fontWeight: "900",
  },
  summarySubtitle: {
    color: THEME.colors.text.muted,
    fontSize: 11,
    fontFamily: THEME.fonts.mono,
    fontWeight: "600",
  },
  summaryText: {
    color: THEME.colors.text.secondary,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: THEME.fonts.body,
    marginBottom: THEME.spacing.xl,
    fontWeight: "500",
  },
  triggerButton: {
    backgroundColor: THEME.colors.primary,
    height: 56,
    borderRadius: THEME.borderRadius.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    ...THEME.shadows.premium,
  },
  disabledButton: {
    opacity: 0.7,
  },
  triggerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 2,
  },
  timelineSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.card,
  },
  emptyText: {
    color: THEME.colors.text.muted,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    marginTop: 16,
    fontWeight: "600",
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
  outcomeButton: {
    backgroundColor: THEME.colors.primary,
    height: 64,
    borderRadius: THEME.borderRadius.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    ...THEME.shadows.premium,
  },
  outcomeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 2,
  },
  activeStatusCard: {
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.2)",
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  activeStatusText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
    fontWeight: "800",
  },
  completedStatusCard: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  completedStatusText: {
    color: "#10B981",
    fontSize: 11,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
    fontWeight: "800",
  },
});
