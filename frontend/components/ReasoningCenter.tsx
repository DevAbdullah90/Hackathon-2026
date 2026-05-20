import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ReasoningStep {
  id: string;
  type: "analysis" | "simulation" | "decision";
  message: string;
  timestamp: string;
  status: "completed" | "ongoing" | "pending";
}

const MOCK_STEPS: ReasoningStep[] = [
  {
    id: "1",
    type: "analysis",
    message:
      "Analyzing precipitation data from Karachi Meteorological Department...",
    timestamp: "02:15:00",
    status: "completed",
  },
  {
    id: "2",
    type: "analysis",
    message: "Identifying high-risk catchment areas in Gulshan-e-Iqbal...",
    timestamp: "02:15:15",
    status: "completed",
  },
  {
    id: "3",
    type: "simulation",
    message: "Running flood propagation model (ResQ by AQUA-Sim v4.2)...",
    timestamp: "02:15:45",
    status: "completed",
  },
  {
    id: "4",
    type: "simulation",
    message: "Predicting peak water levels for University Road intersection...",
    timestamp: "02:16:10",
    status: "ongoing",
  },
  {
    id: "5",
    type: "decision",
    message: "Calculating optimal rescue route for North Nazimabad units...",
    timestamp: "02:16:30",
    status: "pending",
  },
];

interface Props {
  isModal?: boolean;
  showHeader?: boolean;
}

const ReasoningCenter: React.FC<Props> = ({
  isModal = false,
  showHeader = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="bulb-outline" size={26} color="#60A5FA" />
            <Text style={styles.headerTitle}>Reasoning Center</Text>
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 160, // Extra padding for bottom button
        }}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            {/* Timeline */}
            <View style={styles.timeline}>
              <View
                style={[
                  styles.dot,
                  step.status === "completed" && styles.completedDot,
                  step.status === "ongoing" && styles.ongoingDot,
                ]}
              >
                <Ionicons
                  name={
                    step.status === "completed"
                      ? "checkmark"
                      : step.status === "ongoing"
                        ? "sync"
                        : "ellipse"
                  }
                  size={18}
                  color={
                    step.status === "completed"
                      ? "#34D399"
                      : step.status === "ongoing"
                        ? "#60A5FA"
                        : "#64748B"
                  }
                />
              </View>
              {index !== MOCK_STEPS.length - 1 && <View style={styles.line} />}
            </View>

            {/* Card */}
            <View
              style={[
                styles.card,
                step.status === "ongoing" && styles.ongoingCard,
                step.status === "completed" && styles.completedCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.type,
                    step.status === "completed" && styles.completedType,
                    step.status === "ongoing" && styles.ongoingType,
                  ]}
                >
                  {step.type.toUpperCase()}
                </Text>
                <Text style={styles.time}>{step.timestamp}</Text>
              </View>

              <Text style={styles.message}>{step.message}</Text>

              {step.status === "ongoing" && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar} />
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity style={styles.refreshButton} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={18} color="#94A3B8" />
          <Text style={styles.refreshText}>Update Simulation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1C",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { color: "#F1F5F9", fontSize: 20, fontWeight: "600" },
  liveBadge: {
    backgroundColor: "#14532D",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4ADE80",
  },
  liveText: { color: "#4ADE80", fontSize: 13, fontWeight: "bold" },

  scrollView: { flex: 1 },

  stepRow: {
    flexDirection: "row",
    marginBottom: 40,
  },
  timeline: {
    alignItems: "center",
    width: 44,
    marginRight: 16,
  },
  dot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#334155",
  },
  completedDot: { borderColor: "#34D399", backgroundColor: "#052E16" },
  ongoingDot: { borderColor: "#60A5FA", backgroundColor: "#0F172A" },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#334155",
    marginTop: 8,
  },

  card: {
    flex: 1,
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  completedCard: { borderColor: "#34D39920" },
  ongoingCard: { backgroundColor: "#172554", borderColor: "#60A5FA30" },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  type: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#94A3B8",
  },
  completedType: { color: "#34D399" },
  ongoingType: { color: "#60A5FA" },
  time: { fontSize: 13, color: "#64748B" },
  message: {
    fontSize: 15.5,
    lineHeight: 23,
    color: "#E2E8F0",
  },

  progressContainer: {
    marginTop: 16,
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "70%",
    backgroundColor: "#60A5FA",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: "#0A0F1C",
  },
  refreshButton: {
    backgroundColor: "#1E2937",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  refreshText: {
    color: "#94A3B8",
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default ReasoningCenter;
