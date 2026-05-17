import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import AtmosphericBackground from "../components/AtmosphericBackground";
import LiveLogStream from "../components/LiveLogStream";
import { THEME } from "../lib/theme";
import { 
  ChevronLeft, 
  Cpu, 
  Search, 
  Play, 
  Layers,
  Terminal,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ReasoningCenter({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "DEMO-001", location: "Active Sector" };
  const [agentsActive, setAgentsActive] = useState(["ORCHESTRATOR", "GEOSPATIAL", "LOGISTICS"]);
  
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View entering={FadeInDown.duration(1500)} style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </Animated.View>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Mission Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <BlurView intensity={20} tint="dark" style={styles.header}>
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
          </BlurView>
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Agent Status Grid */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.agentGrid}>
            {agentsActive.map((agent, index) => (
              <View key={agent} style={styles.agentCardContainer}>
                <BlurView intensity={30} tint="dark" style={styles.agentCard}>
                  <View style={styles.agentIconContainer}>
                    {index === 0 ? <Cpu size={16} color={THEME.colors.primary} /> : <Layers size={16} color={THEME.colors.text.primary} />}
                  </View>
                  <Text style={styles.agentName}>{agent}</Text>
                  <View style={styles.agentStatusRow}>
                    <Animated.View style={[styles.agentStatusDot, index === 0 ? animatedPulseStyle : null]} />
                    <Text style={styles.agentStatus}>ONLINE</Text>
                  </View>
                </BlurView>
              </View>
            ))}
          </Animated.View>

          {/* Reasoning Console */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.consoleHeader}>
            <View style={styles.consoleTitleRow}>
              <Terminal size={14} color={THEME.colors.text.muted} />
              <Text style={styles.consoleTitle}>AI LOGSTREAM</Text>
            </View>
            <View style={styles.liveBadge}>
              <Animated.View style={[styles.pulseDot, animatedPulseStyle]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.logContainerContainer}>
            <BlurView intensity={20} tint="dark" style={styles.logContainer}>
              <LiveLogStream incidentId={incidentId} />
            </BlurView>
          </Animated.View>

          {/* Strategy Summary */}
          <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.strategyCardContainer}>
            <BlurView intensity={20} tint="dark" style={styles.strategyCard}>
              <View style={styles.strategyHeader}>
                <Search size={16} color={THEME.colors.text.primary} />
                <Text style={styles.strategyTitle}>STRATEGY SYNTHESIS</Text>
              </View>
              <Text style={styles.strategyText}>
                System is cross-referencing rainfall patterns with topography data. 
                Agentic loops are calculating optimal evacuation routes and drainage priorities.
              </Text>
            </BlurView>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Action Footer */}
        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.footer}>
          <TouchableOpacity 
            style={styles.simulationButton}
            onPress={() => navigation.navigate("Simulation", { incidentId, location })}
            activeOpacity={0.8}
          >
            <Play size={16} color={THEME.colors.background} fill={THEME.colors.background} />
            <Text style={styles.simulationButtonText}>INITIATE SIMULATION</Text>
          </TouchableOpacity>
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
    backgroundColor: THEME.colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
  agentCardContainer: {
    flex: 1,
    borderRadius: THEME.borderRadius.md,
    overflow: "hidden",
  },
  agentCard: {
    backgroundColor: THEME.colors.glass,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
  logContainerContainer: {
    borderRadius: THEME.borderRadius.md,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
  },
  logContainer: {
    backgroundColor: THEME.colors.glass,
    padding: THEME.spacing.sm,
    height: 300,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
  strategyCardContainer: {
    borderRadius: THEME.borderRadius.md,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
  },
  strategyCard: {
    backgroundColor: THEME.colors.glass,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
    backgroundColor: "transparent",
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
