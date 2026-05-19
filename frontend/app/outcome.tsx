import React, { useEffect, useState } from "react";
import { View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
   
  StatusBar, 
  ScrollView, 
  Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import AtmosphericBackground from "../components/AtmosphericBackground";
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
  BarChart2,
  AlertTriangle
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function OutcomeScreen({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" };
  const [incident, setIncident] = useState<Incident | null>(null);
  const [bar1, setBar1] = useState(0);
  const [bar2, setBar2] = useState(0);
  const [bar3, setBar3] = useState(0);

  useEffect(() => {
    const fetchIncident = async () => {
      const data = await api.getIncident(incidentId);
      setIncident(data);
      setBar1(85);
      setBar2(95);
      setBar3(60);
    };
    fetchIncident();
  }, [incidentId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      <View style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View>
          <BlurView intensity={20} tint="light" style={styles.header}>
            <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.iconButton}>
              <Home size={18} color={THEME.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MISSION REPORT</Text>
            <View style={{ width: 36 }} /> 
          </BlurView>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successBanner}>
            <View style={styles.bannerIconContainer}>
              <ShieldCheck size={36} color={THEME.colors.background} strokeWidth={1.5} />
            </View>
            <Text style={styles.successTitle}>SITUATION RESOLVED</Text>
            <Text style={styles.successSubtitle}>AGENTIC LOOP TERMINATED SUCCESSFULLY</Text>
          </View>

          {/* Impact Visualizer */}
          <View style={styles.chartCardContainer}>
            <BlurView intensity={25} tint="light" style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <BarChart2 size={16} color={THEME.colors.text.muted} />
                <Text style={styles.chartTitle}>IMPACT REDUCTION ANALYSIS</Text>
              </View>
              <View style={styles.chartBody}>
                <View style={styles.barGroup}>
                  <View style={[styles.barFill, { height: `${bar1}%` }]} />
                  <Text style={styles.barLabel}>TRAFFIC</Text>
                </View>
                <View style={styles.barGroup}>
                  <View style={[styles.barFill, { backgroundColor: THEME.colors.primary, height: `${bar2}%` }]} />
                  <Text style={styles.barLabel}>SAFETY</Text>
                </View>
                <View style={styles.barGroup}>
                  <View style={[styles.barFill, { height: `${bar3}%` }]} />
                  <Text style={styles.barLabel}>RESPONSE</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <Car size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>50+</Text>
              <Text style={styles.statLabel}>VEHICLES REROUTED</Text>
            </BlurView>
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <TrendingDown size={20} color={THEME.colors.primary} />
              <Text style={styles.statValue}>-60%</Text>
              <Text style={styles.statLabel}>CONGESTION REDUCTION</Text>
            </BlurView>
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <Users size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>{incident?.estimated_population || "4.5K"}</Text>
              <Text style={styles.statLabel}>RESIDENTS PROTECTED</Text>
            </BlurView>
            <BlurView intensity={20} tint="light" style={styles.statCard}>
              <Clock size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>45s</Text>
              <Text style={styles.statLabel}>MEAN DETECTION TIME</Text>
            </BlurView>
          </View>

          {/* Visual Route Rerouting Card */}
          <View style={styles.routeCardContainer}>
            <BlurView intensity={20} tint="light" style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <Activity size={16} color={THEME.colors.primary} />
                <Text style={styles.routeTitle}>ACTIVE MULTI-AGENT DETOUR PLAN</Text>
              </View>

              {/* Graphical Layout */}
              <View style={styles.diagramContainer}>
                {/* Node A (Start) */}
                <View style={styles.nodeWrapper}>
                  <View style={[styles.nodeCircle, { backgroundColor: "#3b82f6" }]} />
                  <Text style={styles.nodeText}>Jauhar Chowrangi Chowk</Text>
                </View>

                {/* Vertical tracks */}
                <View style={styles.tracksContainer}>
                  {/* Blocked Track (Red) */}
                  <View style={styles.trackRow}>
                    <View style={styles.dashLineRed} />
                    <View style={styles.statusBadgeRed}>
                      <AlertTriangle size={9} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.badgeText}>🔴 BLOCKED: 1.2M FLOOD</Text>
                    </View>
                    <View style={styles.dashLineRed} />
                  </View>

                  {/* Detour Track (Green) */}
                  <View style={[styles.trackRow, { marginTop: 12 }]}>
                    <View style={styles.solidLineGreen} />
                    <View style={styles.statusBadgeGreen}>
                      <Text style={styles.badgeText}>🟢 BYPASS DETOUR ACTIVE (CLEAR)</Text>
                    </View>
                    <View style={styles.solidLineGreen} />
                  </View>
                </View>

                {/* Node B (End) */}
                <View style={styles.nodeWrapper}>
                  <View style={[styles.nodeCircle, { backgroundColor: "#10b981" }]} />
                  <Text style={styles.nodeText}>University Road Corridor</Text>
                </View>
              </View>

              {/* Explainer Stats */}
              <View style={styles.routeMetaGrid}>
                <View style={styles.routeMetaCard}>
                  <Text style={styles.metaLabel}>DETOUR IMPACT</Text>
                  <Text style={styles.metaValue}>+4.2 Mins ETA</Text>
                </View>
                <View style={styles.routeMetaCard}>
                  <Text style={styles.metaLabel}>VEHICLES REROUTED</Text>
                  <Text style={styles.metaValue}>50+ Diverted</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Detailed Breakdown */}
          <View style={styles.reportCardContainer}>
            <BlurView intensity={20} tint="light" style={styles.reportCard}>
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
            </BlurView>
          </View>

          <View style={{ width: "100%" }}>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => navigation.popToTop()}
            >
              <Text style={styles.doneButtonText}>RETURN TO COMMAND CENTER</Text>
            </TouchableOpacity>
          </View>
          
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
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceSoft,
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
    backgroundColor: THEME.colors.accentSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.glow,
  },
  successTitle: {
    color: THEME.colors.text.primary,
    fontSize: 20,
    fontFamily: THEME.fonts.heading,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: THEME.colors.accent + "60",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  successSubtitle: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    textAlign: "center",
  },
  chartCardContainer: {
    width: "100%",
    borderRadius: THEME.borderRadius.md,
    overflow: "hidden",
    marginBottom: THEME.spacing.lg,
  },
  chartCard: {
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
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
    backgroundColor: THEME.colors.background,
    width: (width - THEME.spacing.lg * 2 - THEME.spacing.md) / 2,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: "hidden",
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
  reportCardContainer: {
    width: "100%",
    borderRadius: THEME.borderRadius.md,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
  },
  reportCard: {
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
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
    backgroundColor: THEME.colors.surfaceSoft,
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
    backgroundColor: THEME.colors.accentSoft,
    width: "100%",
    height: 56,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.18)",
    ...THEME.shadows.glow,
  },
  doneButtonText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
  routeCardContainer: {
    width: "100%",
    borderRadius: THEME.borderRadius.md,
    overflow: "hidden",
    marginBottom: THEME.spacing.lg,
  },
  routeCard: {
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  routeTitle: {
    color: THEME.colors.text.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    fontWeight: "bold",
  },
  diagramContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 8,
    padding: THEME.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  nodeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 8,
  },
  nodeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  nodeText: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.primary,
    fontWeight: "bold",
  },
  tracksContainer: {
    width: "100%",
    paddingVertical: 12,
    paddingLeft: 5,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dashLineRed: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderColor: "#ef4444",
    borderStyle: "dashed",
    opacity: 0.6,
  },
  solidLineGreen: {
    flex: 1,
    height: 3,
    backgroundColor: "#10b981",
  },
  statusBadgeRed: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadgeGreen: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: THEME.fonts.mono,
  },
  routeMetaGrid: {
    flexDirection: "row",
    gap: THEME.spacing.md,
  },
  routeMetaCard: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.01)",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    marginTop: 4,
  },
});
