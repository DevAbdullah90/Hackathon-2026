import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Dimensions,
  Animated
} from "react-native";
import LiveLogStream from "../components/LiveLogStream";
import { THEME } from "../lib/theme";
import { 
  ChevronLeft, 
  Cpu, 
  Search, 
  Play, 
  Layers,
  Terminal,
  Activity
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ReasoningCenter({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "DEMO-001", location: "Active Sector" };
  const [agentsActive, setAgentsActive] = useState(["ORCHESTRATOR", "GEOSPATIAL", "LOGISTICS"]);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Top Mission Header */}
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
            <Text style={styles.missionIdText}>{incidentId}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Agent Status Grid */}
          <View style={styles.agentGrid}>
            {agentsActive.map((agent, index) => (
              <View key={agent} style={styles.agentCard}>
                <View style={styles.agentIconContainer}>
                  {index === 0 ? <Cpu size={16} color={THEME.colors.primary} /> : <Layers size={16} color={THEME.colors.text.primary} />}
                </View>
                <Text style={styles.agentName}>{agent}</Text>
                <View style={styles.agentStatusRow}>
                  <Animated.View style={[styles.agentStatusDot, { opacity: index === 0 ? pulseAnim : 1 }]} />
                  <Text style={styles.agentStatus}>ONLINE</Text>
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
              <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.logContainer}>
            <LiveLogStream incidentId={incidentId} />
          </View>

          {/* Strategy Summary */}
          <View style={styles.strategyCard}>
            <View style={styles.strategyHeader}>
              <Search size={16} color={THEME.colors.text.primary} />
              <Text style={styles.strategyTitle}>STRATEGY SYNTHESIS</Text>
            </View>
            <Text style={styles.strategyText}>
              System is cross-referencing rainfall patterns with topography data. 
              Agentic loops are calculating optimal evacuation routes and drainage priorities.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Action Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.simulationButton}
            onPress={() => navigation.navigate("Simulation", { incidentId, location })}
            activeOpacity={0.8}
          >
            <Play size={16} color={THEME.colors.background} fill={THEME.colors.background} />
            <Text style={styles.simulationButtonText}>INITIATE SIMULATION</Text>
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
  headerInfo: {
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
    letterSpacing: 1,
  },
  missionId: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  missionIdText: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
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
  agentCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: "center",
  },
  agentIconContainer: {
    marginBottom: THEME.spacing.sm,
  },
  agentName: {
    color: THEME.colors.text.primary,
    fontSize: 9,
    fontFamily: THEME.fonts.heading,
    marginBottom: 6,
    letterSpacing: 1,
  },
  agentStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  agentStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
  },
  agentStatus: {
    color: THEME.colors.primary,
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
  consoleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.sm,
  },
  consoleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  consoleTitle: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
  },
  liveText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  logContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    height: 300,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.xl,
  },
  strategyCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.xl,
  },
  strategyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: THEME.spacing.md,
  },
  strategyTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
  strategyText: {
    color: THEME.colors.text.secondary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    lineHeight: 20,
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
  simulationButton: {
    backgroundColor: THEME.colors.text.primary,
    height: 56,
    borderRadius: THEME.borderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  simulationButtonText: {
    color: THEME.colors.background,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
});
