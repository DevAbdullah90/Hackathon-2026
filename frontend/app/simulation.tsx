import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Animated
} from "react-native";
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

const { width } = Dimensions.get("window");

export default function SimView({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" };
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchSimulationState = async () => {
    const data = await api.getSimulationState(incidentId);
    setActions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSimulationState();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(fetchSimulationState, 3000);
    return () => clearInterval(interval);
  }, [incidentId]);

  const handleTriggerSim = async () => {
    setTriggering(true);
    const success = await api.triggerSimulation(incidentId);
    setTriggering(false);
    
    if (success) {
      Alert.alert("SIMULATION ENGAGED", "Orchestrator has begun execution of the response plan.");
    } else {
      Alert.alert("ERROR", "Failed to initiate simulation sequence.");
    }
  };

  const completedCount = actions.filter(a => a.status.toUpperCase() === "COMPLETED").length;
  const allCompleted = actions.length > 0 && completedCount === actions.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
            <View style={styles.summaryHeader}>
              <View style={styles.iconCircle}>
                <Shield size={20} color={THEME.colors.background} />
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
            
            {actions.length === 0 && !loading && (
              <TouchableOpacity 
                style={[styles.triggerButton, triggering && styles.disabledButton]} 
                onPress={handleTriggerSim}
                disabled={triggering}
              >
                {triggering ? (
                  <ActivityIndicator color={THEME.colors.background} size="small" />
                ) : (
                  <>
                    <Rocket size={16} color={THEME.colors.background} />
                    <Text style={styles.triggerButtonText}>ACTIVATE SEQUENCE</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>

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
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={styles.outcomeButton}
              onPress={() => navigation.navigate("Outcome", { incidentId, location })}
            >
              <CheckCircle2 size={20} color={THEME.colors.background} />
              <Text style={styles.outcomeButtonText}>ANALYZE FINAL IMPACT</Text>
            </TouchableOpacity>
          </Animated.View>
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
    paddingVertical: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surface,
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
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 16,
    fontFamily: THEME.fonts.heading,
  },
  statusBadge: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  statusBadgeText: {
    color: THEME.colors.text.primary,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
  },
  summaryCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.xl,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.text.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
  },
  summarySubtitle: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
  },
  summaryText: {
    color: THEME.colors.text.secondary,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: THEME.fonts.body,
    marginBottom: THEME.spacing.xl,
  },
  triggerButton: {
    backgroundColor: THEME.colors.text.primary,
    height: 50,
    borderRadius: THEME.borderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  triggerButtonText: {
    color: THEME.colors.background,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
  timelineSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  sectionTitle: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.colors.surfaceBorder,
  },
  emptyText: {
    color: THEME.colors.text.muted,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    marginTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.lg,
    paddingBottom: 40,
    backgroundColor: THEME.colors.background,
  },
  outcomeButton: {
    backgroundColor: THEME.colors.primary,
    height: 56,
    borderRadius: THEME.borderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  outcomeButtonText: {
    color: THEME.colors.background,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
});
