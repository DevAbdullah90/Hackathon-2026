import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SeverityBadgeProps {
  score: number;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ score }) => {
  let backgroundColor = "#10B981"; // Green (LOW)
  let label = "LOW";

  if (score >= 7.5) {
    backgroundColor = "#DC2626"; // Red (CRITICAL)
    label = "CRITICAL";
  } else if (score >= 4.5) {
    backgroundColor = "#F59E0B"; // Orange (MODERATE)
    label = "MODERATE";
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default SeverityBadge;
