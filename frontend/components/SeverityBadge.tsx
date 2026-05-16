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
    <View style={[styles.badge, { backgroundColor, borderColor: backgroundColor + '40' }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default SeverityBadge;
