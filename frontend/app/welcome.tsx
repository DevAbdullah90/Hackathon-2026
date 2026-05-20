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
              <Droplets size={32} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <View style={styles.logoWave} />
          </View>
        </View>
        <Text style={styles.appName}>CIRO by AQUA</Text>
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
    width: 110,
    height: 110,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    ...THEME.shadows.premium,
    overflow: "hidden",
  },
  logoBlobTop: {
    position: "absolute",
    top: -10,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  logoBlobSide: {
    position: "absolute",
    bottom: 16,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  logoCenter: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoWave: {
    position: "absolute",
    bottom: 20,
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  appName: {
    fontSize: 32,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    letterSpacing: 4,
    fontWeight: "900",
    marginTop: 10,
  },
});
