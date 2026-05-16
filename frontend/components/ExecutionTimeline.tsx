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
  const sortedActions = [...actions].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <View style={styles.container}>
      {sortedActions.map((action, index) => {
        const isCompleted = action.status.toUpperCase() === "COMPLETED";
        const isInProgress = action.status.toUpperCase() === "IN_PROGRESS";
        
        return (
          <View key={action.id} style={styles.timelineItem}>
            {/* Timeline Line */}
            {index !== sortedActions.length - 1 && <View style={styles.line} />}
            
            {/* Icon Node */}
            <View style={[
              styles.node, 
              { backgroundColor: isCompleted ? THEME.colors.primary : isInProgress ? THEME.colors.text.primary : THEME.colors.surfaceElevated }
            ]}>
              {isCompleted ? (
                <CheckCircle2 size={12} color={THEME.colors.background} />
              ) : isInProgress ? (
                <Activity size={12} color={THEME.colors.background} />
              ) : (
                <Clock size={12} color={THEME.colors.text.muted} />
              )}
            </View>

            {/* Content */}
            <View style={[
              styles.content, 
              isInProgress && styles.activeContent
            ]}>
              <View style={styles.headerRow}>
                <Text style={[
                  styles.actionType, 
                  { color: isCompleted ? THEME.colors.text.secondary : isInProgress ? THEME.colors.text.primary : THEME.colors.text.muted }
                ]}>
                  {action.type.toUpperCase()}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(action.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: isCompleted ? THEME.colors.primary : isInProgress ? THEME.colors.text.primary : THEME.colors.text.muted }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: isCompleted ? THEME.colors.primary : isInProgress ? THEME.colors.text.primary : THEME.colors.text.muted }
                ]}>
                  {action.status.toUpperCase()}
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
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: THEME.spacing.lg,
    minHeight: 80,
  },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 4,
    borderColor: THEME.colors.background,
  },
  line: {
    position: "absolute",
    left: 15,
    top: 32,
    bottom: -THEME.spacing.lg,
    width: 2,
    backgroundColor: THEME.colors.surfaceBorder,
    zIndex: 1,
  },
  content: {
    flex: 1,
    marginLeft: THEME.spacing.lg,
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  activeContent: {
    borderColor: THEME.colors.text.primary,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actionType: {
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
});

export default ExecutionTimeline;
