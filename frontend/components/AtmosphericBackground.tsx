import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AtmosphericBackground() {
  return (
    <LinearGradient
      colors={["#FFFFFF", "#F9FAFB", "#E0F2FE"]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
  );
}
