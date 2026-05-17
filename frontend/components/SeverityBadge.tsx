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
        color: THEME.colors.text.primary, 
        bg: THEME.colors.status.critical, // Using red sparingly for true critical
      };
    } else if (score >= 4.5) {
      return { 
        label: "ELEVATED", 
        color: THEME.colors.background, 
        bg: THEME.colors.text.primary, // White background for elevated
      };
    }
    return { 
      label: "NOMINAL", 
      color: THEME.colors.background, 
      bg: THEME.colors.primary, // Green for nominal/success
    };
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
      <View style={[styles.scoreContainer, { backgroundColor: config.color === THEME.colors.background ? THEME.colors.background : "rgba(0,0,0,0.2)" }]}>
        <Text style={[styles.scoreText, { color: config.color === THEME.colors.background ? config.bg : THEME.colors.text.primary }]}>
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
