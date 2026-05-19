import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import AtmosphericBackground from "../components/AtmosphericBackground";
import { THEME } from "../lib/theme";
import SeverityBadge from "../components/SeverityBadge";
import { api, Incident, DashboardStats, AgentWorkforceMember, GlobalTimelineLog } from "../lib/api";
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
  X,
  Navigation,
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

const WebDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats>({
    total_signals: 0,
    active_crisis_sectors: 0,
    total_agent_decisions: 0,
    allocated_ambulances: 0,
    allocated_rescue_crews: 0,
  });
  const [agents, setAgents] = useState<AgentWorkforceMember[]>([]);
  const [timeline, setTimeline] = useState<GlobalTimelineLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [mockTriggering, setMockTriggering] = useState(false);

  const fetchAllData = async () => {
    try {
      const [s, a, t, i] = await Promise.all([
        api.getDashboardStats(),
        api.getAgentWorkforce(),
        api.getGlobalTimeline(),
        api.getActiveIncidents(),
      ]);
      setStats(s);
      setAgents(a);
      setTimeline(t);
      setIncidents(i);
    } catch (e) {
      console.warn("Error fetching web dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3000); // 3-second rapid polling for live feedback
    return () => clearInterval(interval);
  }, []);

  const handleTriggerMockSignal = async () => {
    setMockTriggering(true);
    const result = await api.triggerMockSignal();
    setMockTriggering(false);

    if (result && result.signal_id) {
      // Direct transition to standard processing loader sequence
      navigation.navigate("Processing", { signalId: result.signal_id });
    }
  };

  if (loading) {
    return (
      <View style={styles.webLoaderContainer}>
        <ActivityIndicator color={THEME.colors.primary} size="large" />
        <Text style={styles.webLoaderText}>INITIALIZING COMMAND PANEL...</Text>
      </View>
    );
  }

  return (
    <View style={styles.webContainer}>
      <View style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </View>

      {/* TOP TACTICAL NAVIGATION BAR */}
      <View style={styles.webHeader}>
        <View style={styles.webBrandGroup}>
          <Text style={styles.webBrandTitle}>CIRO COMMAND CENTER</Text>
          <View style={styles.webStatusBadge}>
            <View style={styles.webStatusDot} />
            <Text style={styles.webStatusText}>SYSTEM ONLINE</Text>
          </View>
        </View>

        {/* DEMO TOOLBAR: SINGLE-CLICK TELEMETRY TRIGGER */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.webTriggerBtn, mockTriggering && styles.disabledButton]}
          onPress={handleTriggerMockSignal}
          disabled={mockTriggering}
        >
          <Cpu size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.webTriggerBtnText}>
            {mockTriggering ? "INGESTING TELEMETRY..." : "🚨 TRIGGER MOCK SIGNAL"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* OVERVIEW KEY PERFORMANCE INDICATORS */}
      <View style={styles.webKpisGrid}>
        <View style={styles.webKpiCard}>
          <Text style={styles.webKpiVal}>{stats.total_signals}</Text>
          <Text style={styles.webKpiLbl}>SIGNALS INGESTED</Text>
        </View>
        <View style={styles.webKpiCard}>
          <Text style={[styles.webKpiVal, { color: THEME.colors.status.critical }]}>
            {stats.active_crisis_sectors}
          </Text>
          <Text style={styles.webKpiLbl}>ACTIVE CRISIS SECTORS</Text>
        </View>
        <View style={styles.webKpiCard}>
          <Text style={styles.webKpiVal}>{stats.total_agent_decisions}</Text>
          <Text style={styles.webKpiLbl}>AGENT DECISIONS</Text>
        </View>
        <View style={styles.webKpiCard}>
          <Text style={styles.webKpiVal}>{stats.allocated_ambulances}</Text>
          <Text style={styles.webKpiLbl}>ALLOCATED AMBULANCES</Text>
        </View>
        <View style={styles.webKpiCard}>
          <Text style={styles.webKpiVal}>{stats.allocated_rescue_crews}</Text>
          <Text style={styles.webKpiLbl}>RESCUE TEAMS DISPATCHED</Text>
        </View>
      </View>

      {/* CORE THREE-COLUMN TACTICAL LAYOUT */}
      <View style={styles.webBodyGrid}>
        
        {/* COLUMN 1: PRIORITY INCIDENTS FEED (30% WIDTH) */}
        <View style={styles.webCol30}>
          <View style={styles.webPanelHeader}>
            <Text style={styles.webPanelTitle}>PRIORITY HAZARD SECTORS</Text>
          </View>
          <ScrollView style={styles.webPanelScroll} showsVerticalScrollIndicator={false}>
            {incidents.length > 0 ? (
              incidents.map((incident) => {
                return (
                  <TouchableOpacity
                    key={incident.id}
                    activeOpacity={0.9}
                    style={styles.webIncidentCard}
                    onPress={() =>
                      navigation.navigate("Reasoning", {
                        incidentId: incident.id,
                        location: incident.location,
                      })
                    }
                  >
                    <View style={styles.webIncidentHeader}>
                      <Text style={styles.webIncidentLoc}>{incident.location}</Text>
                      <SeverityBadge score={incident.severity_score} />
                    </View>
                    <View style={styles.webIncidentMetrics}>
                      <View style={styles.webIncidentMetric}>
                        <Text style={styles.webMetricLabel}>CONFIDENCE</Text>
                        <Text style={styles.webMetricValue}>
                          {(incident.confidence * 100).toFixed(0)}%
                        </Text>
                      </View>
                      <View style={styles.webIncidentMetric}>
                        <Text style={styles.webMetricLabel}>POPULATION</Text>
                        <Text style={styles.webMetricValue}>
                          {incident.estimated_population.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.webIncidentFooter}>
                      <Text style={styles.webInspectBtnText}>OPEN AI CORE FOR DETAILED COT →</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.webEmptyState}>
                <Text style={styles.webEmptyTitle}>SECURE & NOMINAL</Text>
                <Text style={styles.webEmptySubtitle}>
                  No anomalies detected across Islamabad.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* COLUMN 2: LIVE AGENT WORKFORCE (40% WIDTH) */}
        <View style={styles.webCol40}>
          <View style={styles.webPanelHeader}>
            <Text style={styles.webPanelTitle}>ACTIVE SPECIALIST AGENT WORKFORCE</Text>
          </View>
          <View style={styles.webAgentsGrid}>
            {agents.map((agentItem, idx) => {
              const isProcessing = agentItem.status === "PROCESSING";
              return (
                <View key={idx} style={[styles.webAgentCard, isProcessing && styles.webAgentActiveCard]}>
                  <View style={styles.webAgentHeader}>
                    <Text style={styles.webAgentName}>{agentItem.agent}</Text>
                    <View
                      style={[
                        styles.webAgentStatusBadge,
                        {
                          backgroundColor: isProcessing
                            ? "rgba(6, 182, 212, 0.15)"
                            : "rgba(16, 185, 129, 0.1)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.webAgentStatusDot,
                          {
                            backgroundColor: isProcessing
                              ? THEME.colors.primary
                              : "#10B981",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.webAgentStatusText,
                          {
                            color: isProcessing ? THEME.colors.primary : "#10B981",
                          },
                        ]}
                      >
                        {agentItem.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.webAgentDesc}>
                    {isProcessing
                      ? `Orchestrating crisis at: ${agentItem.active_incident || "Sector center boundaries"}`
                      : "Nominal operational state. Standby for raw signal telemetry."}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* COLUMN 3: GLOBAL TELEMETRY TIMELINE LOGS (30% WIDTH) */}
        <View style={styles.webCol30}>
          <View style={styles.webPanelHeader}>
            <Text style={styles.webPanelTitle}>GLOBAL TELEMETRY LOG FEED</Text>
          </View>
          <ScrollView style={styles.webPanelScroll} showsVerticalScrollIndicator={false}>
            {timeline.length > 0 ? (
              timeline.map((log) => {
                const logTime = new Date(log.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                return (
                  <View key={log.id} style={styles.webTimelineCard}>
                    <View style={styles.webTimelineHeader}>
                      <Text style={styles.webTimelineAgent}>
                        🛡️ {log.agent_name.replace("_", " ").toUpperCase()}
                      </Text>
                      <Text style={styles.webTimelineTime}>{logTime}</Text>
                    </View>
                    <Text style={styles.webTimelineText}>{log.log_text}</Text>
                    <View style={styles.webTimelineFooter}>
                      <Text style={styles.webTimelineLevelBadge}>
                        LEVEL: {log.log_level.toUpperCase()}
                      </Text>
                      {log.incident_id && (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("Reasoning", {
                              incidentId: log.incident_id,
                              location: "Islamabad crisis sector",
                            })
                          }
                        >
                          <Text style={styles.webTimelineLink}>VIEW INCIDENT →</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.webEmptyState}>
                <Text style={styles.webEmptyTitle}>TIMELINE OFFLINE</Text>
                <Text style={styles.webEmptySubtitle}>Waiting for incoming telemetry stream...</Text>
              </View>
            )}
          </ScrollView>
        </View>

      </View>
    </View>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  if (Platform.OS === "web") {
    return <WebDashboard navigation={navigation} />;
  }

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mockTriggering, setMockTriggering] = useState(false);

  // In-App Radar Alert Notification State
  const [activeAlert, setActiveAlert] = useState<Incident | null>(null);
  const seenIncidentIdsRef = useRef<Set<string>>(new Set());

  const fetchIncidents = async () => {
    try {
      const data = await api.getActiveIncidents();
      
      // Seed seen list initially to avoid historic spamming
      if (seenIncidentIdsRef.current.size === 0 && data.length > 0) {
        data.forEach(i => seenIncidentIdsRef.current.add(String(i.id)));
      } else if (seenIncidentIdsRef.current.size > 0 && data.length > 0) {
        // Detect newly ingested active incidents
        const newIncident = data.find(i => !seenIncidentIdsRef.current.has(String(i.id)));
        if (newIncident) {
          setActiveAlert(newIncident);
          seenIncidentIdsRef.current.add(String(newIncident.id));
        }
      }
      
      setIncidents(data);
    } catch (e) {
      console.warn("Failed to retrieve live incidents feed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 4500);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  const handleTriggerMockSignal = async () => {
    setMockTriggering(true);
    const result = await api.triggerMockSignal();
    setMockTriggering(false);

    if (result && result.signal_id) {
      navigation.navigate("Processing", { signalId: result.signal_id });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      <View style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </View>

      {/* In-App Sliding Neon Danger Alert overlay */}
      {activeAlert && (
        <View style={styles.alertOverlay}>
          <BlurView intensity={95} tint="dark" style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertIndicator}>
                <View style={styles.alertPingDot} />
                <Text style={styles.alertTag}>🚨 EMERGENCY HAZARD INBOUND</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveAlert(null)} style={styles.alertCloseBtn}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.alertLocation}>{activeAlert.location}</Text>
            <Text style={styles.alertDescription}>
              High priority flood risk reported. AI Response Swarm triaging bypass routes.
            </Text>

            <View style={styles.alertParamGrid}>
              <View style={styles.alertParam}>
                <Text style={styles.alertParamLabel}>SEVERITY LEVEL</Text>
                <Text style={styles.alertParamValue}>{activeAlert.severity_score.toFixed(1)} / 10</Text>
              </View>
              <View style={styles.alertParam}>
                <Text style={styles.alertParamLabel}>EST. RESIDENTS</Text>
                <Text style={styles.alertParamValue}>{activeAlert.estimated_population.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const id = activeAlert.id;
                const loc = activeAlert.location;
                setActiveAlert(null);
                navigation.navigate("Reasoning", { incidentId: id, location: loc });
              }}
              style={styles.alertActionBtn}
            >
              <Navigation size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.alertActionBtnText}>LOCATE HAZARD & ENGAGE</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

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

            {/* Quick Mock Trigger Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTriggerMockSignal}
              disabled={mockTriggering}
              style={[
                styles.mockTriggerContainer,
                mockTriggering && styles.disabledButton,
              ]}
            >
              <BlurView intensity={25} tint="light" style={styles.mockTriggerCard}>
                <Cpu size={20} color={THEME.colors.primary} />
                <View style={styles.mockTriggerInfo}>
                  <Text style={styles.mockTriggerTitle}>🚨 TRIGGER SIMULATED CRISIS SIGNAL</Text>
                  <Text style={styles.mockTriggerSubtitle}>
                    {mockTriggering
                      ? "Ingesting telemetry sector..."
                      : "Send mock emergency signals in Islamabad to trigger full AI agent sequence."}
                  </Text>
                </View>
              </BlurView>
            </TouchableOpacity>

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
  alertOverlay: {
    position: "absolute",
    top: THEME.spacing.lg,
    left: THEME.spacing.md,
    right: THEME.spacing.md,
    zIndex: 9999,
  },
  alertCard: {
    borderRadius: 16,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    overflow: "hidden",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.xs,
  },
  alertIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertPingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  alertTag: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: "#EF4444",
    letterSpacing: 1.5,
    fontWeight: "bold",
  },
  alertCloseBtn: {
    padding: 2,
  },
  alertLocation: {
    fontSize: 13,
    fontFamily: THEME.fonts.heading,
    color: "#F9FAFB",
    fontWeight: "bold",
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 9,
    fontFamily: THEME.fonts.body,
    color: "#9CA3AF",
    marginBottom: THEME.spacing.xs,
  },
  alertParamGrid: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  alertParam: {
    flex: 1,
  },
  alertParamLabel: {
    fontSize: 7,
    fontFamily: THEME.fonts.mono,
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  alertParamValue: {
    fontSize: 11,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
    color: "#EF4444",
  },
  alertActionBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: THEME.spacing.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  alertActionBtnText: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
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
  webContainer: {
    flex: 1,
    backgroundColor: "#030712",
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
  },
  webHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: 16,
  },
  webBrandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  webBrandTitle: {
    fontSize: 22,
    fontFamily: THEME.fonts.heading,
    color: "#FFFFFF",
    letterSpacing: 2,
    fontWeight: "bold",
  },
  webStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  webStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  webStatusText: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: "#10B981",
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  webTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.3)",
  },
  disabledButton: {
    opacity: 0.5,
  },
  webTriggerBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  webKpisGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  webKpiCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  webKpiVal: {
    fontSize: 32,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.primary,
    fontWeight: "bold",
  },
  webKpiCardActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: "rgba(15, 118, 110, 0.05)",
  },
  webKpiLbl: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 4,
    letterSpacing: 1,
  },
  webBodyGrid: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
  },
  webCol30: {
    width: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 16,
    display: "flex",
    flexDirection: "column",
  },
  webCol40: {
    width: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 16,
    display: "flex",
    flexDirection: "column",
  },
  webPanelHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    paddingBottom: 12,
    marginBottom: 16,
  },
  webPanelTitle: {
    fontSize: 11,
    fontFamily: THEME.fonts.mono,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1.5,
    fontWeight: "bold",
  },
  webPanelScroll: {
    flex: 1,
  },
  webIncidentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  webIncidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  webIncidentLoc: {
    fontSize: 13,
    fontFamily: THEME.fonts.heading,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  webIncidentMetrics: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  webIncidentMetric: {
    flex: 1,
    alignItems: "center",
  },
  webMetricLabel: {
    fontSize: 7,
    fontFamily: THEME.fonts.mono,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 2,
  },
  webMetricValue: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  webIncidentFooter: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
    paddingTop: 8,
  },
  webInspectBtnText: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.primary,
    fontWeight: "bold",
  },
  webAgentsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  webAgentCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: 12,
    justifyContent: "space-between",
    minHeight: 110,
  },
  webAgentActiveCard: {
    borderColor: THEME.colors.primary,
    backgroundColor: "rgba(15, 118, 110, 0.05)",
  },
  webAgentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  webAgentName: {
    fontSize: 11,
    fontFamily: THEME.fonts.heading,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  webAgentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  webAgentStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  webAgentStatusText: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
  },
  webAgentDesc: {
    fontSize: 9,
    fontFamily: THEME.fonts.subheading,
    color: "rgba(255, 255, 255, 0.5)",
    lineHeight: 12,
  },
  webTimelineCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  webTimelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  webTimelineAgent: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.primary,
    fontWeight: "bold",
  },
  webTimelineTime: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    color: "rgba(255, 255, 255, 0.4)",
  },
  webTimelineText: {
    fontSize: 10,
    fontFamily: THEME.fonts.subheading,
    color: "#FFFFFF",
    lineHeight: 14,
    marginBottom: 8,
  },
  webTimelineFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
    paddingTop: 6,
  },
  webTimelineLevelBadge: {
    fontSize: 7,
    fontFamily: THEME.fonts.mono,
    color: "rgba(255, 255, 255, 0.4)",
  },
  webTimelineLink: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.primary,
    fontWeight: "bold",
  },
  webLoaderContainer: {
    flex: 1,
    backgroundColor: "#030712",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  webLoaderText: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.primary,
    letterSpacing: 2,
  },
  webEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  webEmptyTitle: {
    fontSize: 11,
    fontFamily: THEME.fonts.mono,
    color: "#FFFFFF",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  webEmptySubtitle: {
    fontSize: 9,
    fontFamily: THEME.fonts.subheading,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
  },
  mockTriggerContainer: {
    borderRadius: THEME.borderRadius.lg,
    overflow: "hidden",
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.3)",
  },
  mockTriggerCard: {
    backgroundColor: "rgba(15, 118, 110, 0.05)",
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
    minHeight: 74,
  },
  mockTriggerInfo: {
    flex: 1,
  },
  mockTriggerTitle: {
    fontSize: 10,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  mockTriggerSubtitle: {
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
    lineHeight: 12,
  },
});

export default Dashboard;
