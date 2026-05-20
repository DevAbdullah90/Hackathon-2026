import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SimulationView = () => {
  const [rainfall, setRainfall] = useState(42);
  const [drainage, setDrainage] = useState(78);
  const [risk, setRisk] = useState(65);

  useEffect(() => {
    const interval = setInterval(() => {
      setRainfall((prev) =>
        Math.max(32, Math.min(82, prev + (Math.random() * 5 - 2.5))),
      );
      setDrainage((prev) =>
        Math.max(65, Math.min(96, prev + (Math.random() * 3 - 1.5))),
      );
      setRisk((prev) =>
        Math.max(48, Math.min(92, prev + (Math.random() * 6 - 3))),
      );
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="pulse" size={24} color="#10B981" />
          <Text style={styles.headerTitle}>ResQ by AQUA-Sim Center</Text>
        </View>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Overall Risk - Big Circle */}
      <View style={styles.riskContainer}>
        <View style={styles.riskCircle}>
          <Text style={styles.riskLabel}>OVERALL RISK</Text>
          <Text style={styles.riskValue}>{risk.toFixed(0)}%</Text>
          <Text style={styles.riskLevel}>CRITICAL</Text>
        </View>
      </View>

      {/* Metrics - Compact Row */}
      <View style={styles.metricsRow}>
        {/* Rainfall */}
        <View style={styles.metricBox}>
          <Ionicons name="rainy-outline" size={22} color="#60A5FA" />
          <Text style={styles.metricValue}>{rainfall.toFixed(1)}</Text>
          <Text style={styles.metricUnit}>mm/hr</Text>
          <View style={styles.smallProgressBg}>
            <View
              style={[
                styles.smallProgress,
                { width: `${rainfall}%`, backgroundColor: "#60A5FA" },
              ]}
            />
          </View>
        </View>

        {/* Drainage */}
        <View style={styles.metricBox}>
          <Ionicons name="water-outline" size={22} color="#34D399" />
          <Text style={styles.metricValue}>{drainage}</Text>
          <Text style={styles.metricUnit}>%</Text>
          <View style={styles.smallProgressBg}>
            <View
              style={[
                styles.smallProgress,
                { width: `${drainage}%`, backgroundColor: "#34D399" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>Adjust Params</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Reroute Flow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1C",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    color: "#F1F5F9",
    fontSize: 20,
    fontWeight: "600",
  },
  liveBadge: {
    backgroundColor: "#14532D",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4ADE80",
  },
  liveText: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "bold",
  },

  riskContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  riskCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: "#10B98130",
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
  },
  riskLabel: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  riskValue: { color: "#34D399", fontSize: 42, fontWeight: "800" },
  riskLevel: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  metricValue: {
    color: "#F1F5F9",
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 6,
  },
  metricUnit: {
    color: "#64748B",
    fontSize: 13,
  },
  smallProgressBg: {
    height: 5,
    width: "100%",
    backgroundColor: "#334155",
    borderRadius: 999,
    marginTop: 8,
    overflow: "hidden",
  },
  smallProgress: {
    height: "100%",
    borderRadius: 999,
  },

  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1F2937",
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 13,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default SimulationView;
