import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import AtmosphericBackground from "../components/AtmosphericBackground";
import { THEME } from "../lib/theme";
import SeverityBadge from "../components/SeverityBadge";
import { api, Incident } from "../lib/api";
import {
  LayoutDashboard,
  Map as MapIcon,
  Cpu,
  Bell,
  Users,
  Clock,
  ChevronRight,
  ShieldCheck,
  Target,
} from "lucide-react-native";

interface DashboardProps {
  navigation: any;
}

interface IncidentCardProps {
  item: Incident;
  navigation: any;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ item, navigation }) => {
  const severityPercentage = (item.severity_score / 10) * 100;
  const isCritical = item.severity_score >= 7.5;

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Reasoning", { incidentId: item.id, location: item.location })}
      >
        <BlurView intensity={30} tint="light" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardLocation}>{item.location}</Text>
              <View style={styles.cardTimestamp}>
                <Clock size={10} color={THEME.colors.text.muted} />
                <Text style={styles.cardTimeText}>
                  {new Date(
                    item.created_at.endsWith("Z") || item.created_at.includes("+")
                      ? item.created_at
                      : item.created_at + "Z"
                  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
            <SeverityBadge score={item.severity_score} />
          </View>

          <View style={styles.severityBarContainer}>
            <View
              style={[
                styles.severityBarFill,
                {
                  width: `${severityPercentage}%`,
                  backgroundColor: isCritical ? THEME.colors.text.primary : THEME.colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.cardStatsGrid}>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatLabel}>CONFIDENCE</Text>
              <Text style={styles.cardStatValue}>{(item.confidence * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatLabel}>POPULATION</Text>
              <Text style={styles.cardStatValue}>{item.estimated_population}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.agentStatus}>
              <Cpu size={12} color={THEME.colors.primary} />
              <Text style={styles.agentStatusText}>ORCHESTRATOR ACTIVE</Text>
            </View>
            <ChevronRight size={16} color={THEME.colors.text.muted} />
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    const data = await api.getActiveIncidents();
    setIncidents(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      <View style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </View>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Executive Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>COMMAND CENTER</Text>
            <View style={styles.systemStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>CIRO-ORCHESTRATOR ONLINE</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerIconButton}>
            <Bell size={20} color={THEME.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
          }
        >
          {/* High-End KPI Dashboard */}
          <View style={styles.kpiContainer}>
            <BlurView intensity={20} tint="light" style={styles.kpiCard}>
              <View style={styles.kpiIconWrapper}>
                <Target size={16} color={THEME.colors.background} />
              </View>
              <View style={styles.kpiInfo}>
                <Text style={styles.kpiValue}>{incidents.length}</Text>
                <Text style={styles.kpiLabel}>ACTIVE ZONES</Text>
              </View>
            </BlurView>
            <BlurView intensity={20} tint="light" style={styles.kpiCard}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: THEME.colors.surfaceElevated }]}>
                <Users size={16} color={THEME.colors.text.primary} />
              </View>
              <View style={styles.kpiInfo}>
                <Text style={styles.kpiValue}>{(incidents.reduce((acc, i) => acc + i.estimated_population, 0) / 1000).toFixed(1)}k</Text>
                <Text style={styles.kpiLabel}>POPULATION AFFECTED</Text>
              </View>
            </BlurView>
          </View>

          {/* Quick Actions Panel */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>SYSTEM MODULES</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCardContainer}
              onPress={() => navigation.navigate("Map")}
            >
              <BlurView intensity={30} tint="light" style={styles.actionCard}>
                  <MapIcon size={20} color={THEME.colors.primary} />
                  <Text style={styles.actionTitle} numberOfLines={2}>LIVE FLOOD MAP</Text>
                </BlurView>
            </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCardContainer}
                onPress={() => {
                  if (incidents.length > 0) {
                    navigation.navigate("Reasoning", { incidentId: incidents[0].id, location: incidents[0].location });
                  }
                }}
              >
                <BlurView intensity={30} tint="light" style={styles.actionCard}>
                  <Cpu size={20} color={THEME.colors.primary} />
                  <Text style={styles.actionTitle}>AI LOGSTREAM</Text>
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Crisis Feed */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>PRIORITY INCIDENTS</Text>
            </View>

            {loading ? (
              <ActivityIndicator color={THEME.colors.primary} size="large" style={styles.loader} />
            ) : incidents.length > 0 ? (
              incidents.map((item) => (
                <IncidentCard key={item.id} item={item} navigation={navigation} />
              ))
            ) : (
              <BlurView intensity={20} tint="light" style={styles.emptyState}>
                <ShieldCheck size={32} color={THEME.colors.primary} strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>ALL CLEAR</Text>
                <Text style={styles.emptySubtitle}>No active operational anomalies.</Text>
              </BlurView>
            )}
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Global Navigation Bar */}
        <View style={styles.navBarWrapper}>
          <BlurView intensity={50} tint="light" style={styles.navBar}>
            <TouchableOpacity style={styles.navItem}>
              <LayoutDashboard size={20} color={THEME.colors.primary} strokeWidth={2.5} />
              <Text style={[styles.navLabel, { color: THEME.colors.primary }]}>DASHBOARD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Map")}>
              <MapIcon size={20} color={THEME.colors.text.muted} strokeWidth={2} />
              <Text style={styles.navLabel}>MAP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => {
              if (incidents.length > 0) {
                navigation.navigate("Reasoning", { incidentId: incidents[0].id, location: incidents[0].location });
              }
            }}>
              <Cpu size={20} color={THEME.colors.text.muted} strokeWidth={2} />
              <Text style={styles.navLabel}>AI CORE</Text>
            </TouchableOpacity>
          </BlurView>
        </View>

      </SafeAreaView>
    </View>
  );
};

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
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    letterSpacing: 2,
  },
  systemStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: THEME.spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
    marginRight: THEME.spacing.sm,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  statusText: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.primary,
    letterSpacing: 2,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  scrollView: {
    flex: 1,
  },
  kpiContainer: {
    flexDirection: "row",
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: "hidden",
  },
  kpiIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  kpiInfo: {
    marginTop: THEME.spacing.md,
  },
  kpiValue: {
    fontSize: 24,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
  },
  kpiLabel: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.md,
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.secondary,
    letterSpacing: 2,
    marginBottom: THEME.spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    gap: THEME.spacing.md,
  },
  actionCardContainer: {
    flex: 1,
    borderRadius: THEME.borderRadius.lg,
    overflow: "hidden",
  },
  actionCard: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
  },
  actionTitle: {
    flex: 1,
    fontSize: 9,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    letterSpacing: 0.8,
    lineHeight: 12,
    flexShrink: 1,
  },
  card: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    minHeight: 210,
  },
  cardWrapper: {
    marginBottom: THEME.spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: THEME.spacing.sm,
  },
  cardHeaderInfo: {
    flex: 1,
    marginRight: THEME.spacing.md,
  },
  cardLocation: {
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
    letterSpacing: 1,
  },
  cardTimestamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.xs,
  },
  cardTimeText: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
  },
  severityBarContainer: {
    height: 4,
    backgroundColor: THEME.colors.surfaceBorder,
    borderRadius: 2,
    marginBottom: THEME.spacing.lg,
    overflow: "hidden",
  },
  severityBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  cardStatsGrid: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  cardStat: {
    flex: 1,
    alignItems: "center",
  },
  cardStatLabel: {
    fontSize: 7,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
    marginBottom: THEME.spacing.xs,
    letterSpacing: 0.5,
  },
  cardStatValue: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.primary,
    fontWeight: "bold",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  agentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.sm,
  },
  agentStatusText: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  navBarWrapper: {
    position: "absolute",
    bottom: 30,
    left: THEME.spacing.xl,
    right: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.full,
    overflow: "hidden",
    ...THEME.shadows.card,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navLabel: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
    marginTop: THEME.spacing.xs,
    letterSpacing: 1,
    textAlign: "center",
  },
  loader: {
    marginTop: THEME.spacing.xxl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: THEME.spacing.xxl,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  emptyTitle: {
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.primary,
    marginTop: THEME.spacing.md,
    letterSpacing: 2,
  },
  emptySubtitle: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
    textAlign: "center",
    marginTop: THEME.spacing.xs,
  },
});

export default Dashboard;
