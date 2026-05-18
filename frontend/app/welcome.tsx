import React from "react";
import { View, Text, StyleSheet, StatusBar, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Droplets } from "lucide-react-native";
import { THEME } from "../lib/theme";

export default function WelcomeScreen({ navigation }: any) {
  return (
    <Pressable style={styles.container} onPress={() => navigation.replace("Dashboard")}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.surfaceSoft} />

        <View style={styles.brandBlock}>
        <View style={styles.logoFrame}>
          <View style={styles.logoHalo} />
          <View style={styles.logoCore}>
            <View style={styles.logoBlobTop} />
            <View style={styles.logoBlobSide} />
            <View style={styles.logoCenter}>
              <Droplets size={32} color={THEME.colors.background} strokeWidth={2.2} />
            </View>
            <View style={styles.logoWave} />
          </View>
        </View>
        <Text style={styles.appName}>CIRO</Text>
      </View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSoft,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brandBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoFrame: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: THEME.spacing.lg,
  },
  logoHalo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(15, 118, 110, 0.06)",
  },
  logoCore: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: THEME.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: "hidden",
  },
  logoBlobTop: {
    position: "absolute",
    top: -8,
    left: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  logoBlobSide: {
    position: "absolute",
    bottom: 14,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  logoCenter: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoWave: {
    position: "absolute",
    bottom: 18,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  appName: {
    fontSize: 26,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    letterSpacing: 1.2,
    fontWeight: "800",
  },
});
