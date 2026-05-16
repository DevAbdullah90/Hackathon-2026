import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  Dimensions
} from "react-native";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  ZoomIn,
  useSharedValue, 
  withTiming, 
  withDelay,
  useAnimatedStyle 
} from "react-native-reanimated";
import { api, Incident } from "../lib/api";
import { THEME } from "../lib/theme";
import { 
  Home, 
  ShieldCheck, 
  Users, 
  Clock, 
  TrendingDown, 
  Car, 
  MapPin, 
  Activity,
  BarChart2
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function OutcomeScreen({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" };
  const [incident, setIncident] = useState<Incident | null>(null);
  
  const bar1 = useSharedValue(0);
  const bar2 = useSharedValue(0);
  const bar3 = useSharedValue(0);

  useEffect(() => {
    const fetchIncident = async () => {
      const data = await api.getIncident(incidentId);
      setIncident(data);
      
      bar1.value = withDelay(500, withTiming(85, { duration: 1000 }));
      bar2.value = withDelay(700, withTiming(95, { duration: 1000 }));
      bar3.value = withDelay(900, withTiming(60, { duration: 1000 }));
    };
    fetchIncident();
  }, [incidentId]);

  const animatedBar1 = useAnimatedStyle(() => ({ height: `${bar1.value}%` }));
  const animatedBar2 = useAnimatedStyle(() => ({ height: `${bar2.value}%` }));
  const animatedBar3 = useAnimatedStyle(() => ({ height: `${bar3.value}%` }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.iconButton}>
            <Home size={18} color={THEME.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MISSION REPORT</Text>
          <View style={{ width: 36 }} /> 
        </Animated.View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.successBanner}>
            <Animated.View entering={ZoomIn.delay(300).springify()} style={styles.bannerIconContainer}>
              <ShieldCheck size={36} color={THEME.colors.background} strokeWidth={1.5} />
            </Animated.View>
            <Text style={styles.successTitle}>SITUATION RESOLVED</Text>
            <Text style={styles.successSubtitle}>AGENTIC LOOP TERMINATED SUCCESSFULLY</Text>
          </Animated.View>

          {/* Impact Visualizer (Simple Animated Bar Chart) */}
          <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <BarChart2 size={16} color={THEME.colors.text.muted} />
              <Text style={styles.chartTitle}>IMPACT REDUCTION ANALYSIS</Text>
            </View>
            <View style={styles.chartBody}>
              <View style={styles.barGroup}>
                <Animated.View style={[styles.barFill, animatedBar1]} />
                <Text style={styles.barLabel}>TRAFFIC</Text>
              </View>
              <View style={styles.barGroup}>
                <Animated.View style={[styles.barFill, { backgroundColor: THEME.colors.primary }, animatedBar2]} />
                <Text style={styles.barLabel}>SAFETY</Text>
              </View>
              <View style={styles.barGroup}>
                <Animated.View style={[styles.barFill, animatedBar3]} />
                <Text style={styles.barLabel}>RESPONSE</Text>
              </View>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Car size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>50+</Text>
              <Text style={styles.statLabel}>VEHICLES REROUTED</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingDown size={20} color={THEME.colors.primary} />
              <Text style={styles.statValue}>-60%</Text>
              <Text style={styles.statLabel}>CONGESTION REDUCTION</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>{incident?.estimated_population || "4.5K"}</Text>
              <Text style={styles.statLabel}>RESIDENTS PROTECTED</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>45s</Text>
              <Text style={styles.statLabel}>MEAN DETECTION TIME</Text>
            </View>
          </Animated.View>

          {/* Detailed Breakdown */}
          <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.reportCard}>
            <Text style={styles.reportCardTitle}>SUMMARY ANALYSIS</Text>
            
            <View style={styles.reportItem}>
              <View style={styles.reportItemIcon}>
                <MapPin size={16} color={THEME.colors.text.primary} />
              </View>
              <View style={styles.reportItemContent}>
                <Text style={styles.itemTitle}>Location Secured</Text>
                <Text style={styles.itemDescription}>{location}</Text>
              </View>
            </View>

            <View style={styles.reportItem}>
              <View style={styles.reportItemIcon}>
                <Activity size={16} color={THEME.colors.text.primary} />
              </View>
              <View style={styles.reportItemContent}>
                <Text style={styles.itemTitle}>Infrastructure Integrity</Text>
                <Text style={styles.itemDescription}>Nearby hospitals and power grids remained operational throughout the event.</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(700).springify()} style={{ width: '100%' }}>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => navigation.popToTop()}
            >
              <Text style={styles.doneButtonText}>RETURN TO COMMAND CENTER</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.lg,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: THEME.spacing.lg,
    alignItems: "center",
  },
  successBanner: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  bannerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  successTitle: {
    color: THEME.colors.text.primary,
    fontSize: 20,
    fontFamily: THEME.fonts.heading,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 1,
  },
  successSubtitle: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: THEME.colors.surface,
    width: "100%",
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.lg,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  chartTitle: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
  chartBody: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    paddingBottom: 20,
  },
  barGroup: {
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barFill: {
    width: 30,
    backgroundColor: THEME.colors.text.secondary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    color: THEME.colors.text.muted,
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    marginTop: 8,
    position: "absolute",
    bottom: 0,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  statCard: {
    backgroundColor: THEME.colors.surface,
    width: (width - THEME.spacing.lg * 2 - THEME.spacing.md) / 2,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  statValue: {
    color: THEME.colors.text.primary,
    fontSize: 20,
    fontFamily: THEME.fonts.heading,
    marginTop: THEME.spacing.sm,
  },
  statLabel: {
    color: THEME.colors.text.muted,
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: "center",
  },
  reportCard: {
    backgroundColor: THEME.colors.surface,
    width: "100%",
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  reportCardTitle: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    marginBottom: THEME.spacing.lg,
  },
  reportItem: {
    flexDirection: "row",
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  reportItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  reportItemContent: {
    flex: 1,
  },
  itemTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    marginBottom: 4,
  },
  itemDescription: {
    color: THEME.colors.text.secondary,
    fontSize: 11,
    fontFamily: THEME.fonts.body,
    lineHeight: 18,
  },
  doneButton: {
    backgroundColor: THEME.colors.text.primary,
    width: "100%",
    height: 56,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: {
    color: THEME.colors.background,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
});
