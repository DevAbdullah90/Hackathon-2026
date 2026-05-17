import React from "react";
import { View, StyleSheet } from "react-native";
import { THEME } from "../lib/theme";

export default function AtmosphericBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "#F8FAFC" }]} />
  );
}
