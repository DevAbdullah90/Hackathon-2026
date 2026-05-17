import React, { useEffect, useState } from "react";
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
} from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
import { BlurView } from "expo-blur";
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

const { width } = Dimensions.get("window");

export default function SimView({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" };
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchSimulationState = async () => {
    const data = await api.getSimulationState(incidentId);
    setActions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSimulationState();

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
      <Animated.View entering={FadeInDown.duration(1500)} style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </Animated.View>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <BlurView intensity={20} tint="dark" style={styles.header}>
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
          </BlurView>
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.summaryCardContainer}>
            <BlurView intensity={25} tint="dark" style={styles.summaryCard}>
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
            </BlurView>
          </Animated.View>

          {/* Timeline Section */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.timelineSection}>
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
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Success Footer */}
        {allCompleted && (
          <Animated.View entering={FadeInUp.springify()} style={styles.footer}>
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
    backgroundColor: THEME.colors.glass,
    gap: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.glassBorder,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.glass,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
    backgroundColor: THEME.colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
  summaryCardContainer: {
    borderRadius: THEME.borderRadius.md,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
  },
  summaryCard: {
    backgroundColor: THEME.colors.glass,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
    backgroundColor: THEME.colors.glass,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.colors.glassBorder,
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
    backgroundColor: "transparent",
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
