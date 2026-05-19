import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../lib/theme";
import { CheckCircle2, Clock, Activity } from "lucide-react-native";

interface Action {
  id: string;
  type: string;
  status: string;
  updated_at: string;
}

interface ExecutionTimelineProps {
  actions: Action[];
}

const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ actions }) => {
  const parseUTC = (str: string) => {
    if (!str) return new Date();
    return new Date(str.endsWith("Z") || str.includes("+") ? str : str + "Z");
  };

  const sortedActions = [...actions].sort(
    (a, b) => parseUTC(a.updated_at).getTime() - parseUTC(b.updated_at).getTime()
  );

  return (
    <View style={styles.container}>
      {sortedActions.map((action, index) => {
        const isCompleted = action.status.toUpperCase() === "COMPLETED";
        const isInProgress = ["ACTIVE", "RUNNING", "SENT", "ON_SITE"].includes(action.status.toUpperCase());
        
        return (
          <View key={action.id} style={styles.timelineItem}>
            <View style={[
              styles.block,
              isCompleted && styles.completedBlock,
              isInProgress && styles.activeBlock,
            ]}>
              <View style={styles.headerRow}>
                <View style={styles.typeContainer}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} color="#FFFFFF" />
                  ) : isInProgress ? (
                    <Activity size={14} color="#FFFFFF" />
                  ) : (
                    <Clock size={14} color={THEME.colors.text.muted} />
                  )}
                  <Text style={[
                    styles.actionType,
                    (isCompleted || isInProgress) ? { color: "#FFFFFF" } : { color: THEME.colors.text.primary }
                  ]}>
                    {action.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={[
                  styles.timestamp,
                  (isCompleted || isInProgress) ? { color: "rgba(255, 255, 255, 0.8)" } : { color: THEME.colors.text.muted }
                ]}>
                  {parseUTC(action.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View style={styles.footerRow}>
                <View style={[
                  styles.statusBadge,
                  isCompleted ? styles.statusBadgeCompleted : isInProgress ? styles.statusBadgeActive : styles.statusBadgePending
                ]}>
                  <Text style={[
                    styles.statusText,
                    isCompleted ? { color: "#065F46" } : isInProgress ? { color: "#1E3A8A" } : { color: THEME.colors.text.muted }
                  ]}>
                    {action.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[
                  styles.agentLabel,
                  (isCompleted || isInProgress) ? { color: "rgba(255, 255, 255, 0.7)" } : { color: THEME.colors.text.muted }
                ]}>
                  ORCHESTRATOR DISPATCHED
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  timelineItem: {
    marginBottom: THEME.spacing.md,
  },
  block: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.card,
  },
  activeBlock: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryDark,
    ...THEME.shadows.glow,
  },
  completedBlock: {
    backgroundColor: THEME.colors.status.success,
    borderColor: "#059669",
    ...THEME.shadows.card,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionType: {
    fontSize: 13,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgePending: {
    backgroundColor: THEME.colors.surfaceSoft,
  },
  statusBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  statusBadgeCompleted: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  statusText: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    fontWeight: "900",
    letterSpacing: 1,
  },
  agentLabel: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

export default ExecutionTimeline;
