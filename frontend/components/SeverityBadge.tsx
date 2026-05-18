import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../lib/theme";

interface SeverityBadgeProps {
  score: number;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ score }) => {
  const getBadgeConfig = () => {
    if (score >= 7.5) {
      return { 
        label: "CRITICAL", 
        color: THEME.colors.status.critical, 
        bg: "rgba(220, 38, 38, 0.10)",
        border: "rgba(220, 38, 38, 0.22)",
      };
    } else if (score >= 4.5) {
      return { 
        label: "ELEVATED", 
        color: THEME.colors.primary, 
        bg: "rgba(15, 118, 110, 0.08)",
        border: "rgba(15, 118, 110, 0.18)",
      };
    }
    return { 
      label: "NOMINAL", 
      color: THEME.colors.primary, 
      bg: THEME.colors.accentSoft,
      border: "rgba(16, 185, 129, 0.18)",
    };
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
      <View style={[styles.scoreContainer, { backgroundColor: THEME.colors.background }]}>
        <Text style={[styles.scoreText, { color: config.color }]}>
          {score.toFixed(1)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    gap: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
  },
  scoreContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  scoreText: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
  },
});

export default SeverityBadge;
