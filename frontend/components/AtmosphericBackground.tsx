import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "../lib/theme";

const { width, height } = Dimensions.get("window");

export default function AtmosphericBackground() {
  const orb1X = useSharedValue(-50);
  const orb1Y = useSharedValue(0);
  const orb2X = useSharedValue(width);
  const orb2Y = useSharedValue(height / 2);

  useEffect(() => {
    orb1X.value = withRepeat(
      withSequence(
        withTiming(width * 0.5, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-50, { duration: 15000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(height * 0.3, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    orb2X.value = withRepeat(
      withSequence(
        withTiming(width * 0.2, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
        withTiming(width, { duration: 18000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    orb2Y.value = withRepeat(
      withSequence(
        withTiming(height * 0.8, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(height / 2, { duration: 14000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Base Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: THEME.colors.background }]} />
      
      {/* Moving Orbs */}
      <Animated.View style={[styles.orb, orb1Style]}>
        <LinearGradient
          colors={[THEME.colors.primary + "33", "transparent"]}
          style={styles.orbInner}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.orb, { width: 300, height: 300 }, orb2Style]}>
        <LinearGradient
          colors={[THEME.colors.accent + "22", "transparent"]}
          style={styles.orbInner}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Grid Overlay for Texture */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridVertical} />
        <View style={styles.gridHorizontal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.6,
  },
  orbInner: {
    flex: 1,
    borderRadius: 999,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    pointerEvents: "none",
  },
  gridVertical: {
    ...StyleSheet.absoluteFillObject,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#064E3B",
    left: "50%",
  },
  gridHorizontal: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#064E3B",
    top: "50%",
  },
});
