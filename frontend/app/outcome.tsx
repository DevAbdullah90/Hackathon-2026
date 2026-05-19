import React, { useEffect, useState } from "react";
import { View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
   
  StatusBar, 
  ScrollView, 
  Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtmosphericBackground from "../components/AtmosphericBackground";
import { api, Incident, ReasoningLog } from "../lib/api";
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

const STAGES = [
  { key: "signal_agent", label: "Signal Parser" },
  { key: "detection_agent", label: "Clusterer" },
  { key: "verification_agent", label: "Social Verifier" },
  { key: "severity_agent", label: "Severity Indexer" },
  { key: "resource_allocation_agent", label: "Resource Specialist" },
  { key: "planning_agent", label: "Planner Coordinator" },
  { key: "notification_agent", label: "Public Broadcast" },
];

export default function OutcomeScreen({ route, navigation }: any) {
  const { incidentId, location } = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" };
  const [incident, setIncident] = useState<Incident | null>(null);
  const [reasoningLogs, setReasoningLogs] = useState<ReasoningLog[]>([]);
  const [bar1, setBar1] = useState(0);
  const [bar2, setBar2] = useState(0);
  const [bar3, setBar3] = useState(0);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const data = await api.getIncident(incidentId);
        setIncident(data);
        const logs = await api.getReasoningLogs(incidentId);
        setReasoningLogs(logs);
      } catch (err) {
        console.warn("Failed to fetch incident details or logs:", err);
      }
      setBar1(85);
      setBar2(95);
      setBar3(60);
    };
    fetchIncident();
  }, [incidentId]);

  const getStageTrace = (stageKey: string, idx: number) => {
    const isHeatwave = incident?.disaster_type === "heatwave";
    const locationText = location || "Karachi";
    const severityScoreVal = incident?.severity_score || 8.8;

    // Find reasoning log for this agent
    const agentLog = reasoningLogs.find(
      l => l.agent_name === stageKey || 
      (stageKey === "resource_allocation_agent" && l.agent_name === "resource_agent")
    );
    
    let desc = "";
    let statusLabel = "";
    
    if (agentLog) {
      const text = agentLog.log_text;
      const lines = text.split("\n").map((l: any) => l.trim()).filter(Boolean);
      
      const statusLine = lines.find((l: any) => l.toUpperCase().startsWith("**STATUS**:"));
      if (statusLine) {
        statusLabel = statusLine.replace(/\*\*Status\*\*:/i, "").trim();
      }
      
      const narrativeLine = lines.find((l: any) => !l.startsWith("###") && !l.startsWith("**") && !l.startsWith("-") && !l.startsWith("---"));
      if (narrativeLine) {
        desc = narrativeLine;
      } else {
        desc = agentLog.log_text;
      }
    } else {
      if (isHeatwave) {
        if (stageKey === "signal_agent") {
          desc = `The Signal Processor identified a report regarding extreme weather conditions in ${locationText}, with temperatures reaching 47 degrees Celsius. Citizens were reported fainting near Empress Market due to high humidity, alongside multiple reports of load-shedding in various zones.`;
          statusLabel = "SIGNAL PROCESSED";
        }
        else if (stageKey === "detection_agent") {
          desc = `The Incident Detector assessed a situation in ${locationText} but did not confirm it as an incident. Despite a signal count of one and supporting evidence of extreme temperatures and citizens fainting, the confidence level remained at zero, prompting monitoring for further verification.`;
          statusLabel = "MONITORING";
        }
        else if (stageKey === "verification_agent") {
          desc = `The Verification Agent confirmed the flooding incident in ${locationText} based on news reports and traffic data indicating significant flooding with multiple fatalities. A verification score of 0.35 supported this decision, prompting a recommended action to notify the Triage Agent for further handling.`;
          statusLabel = "VERIFIED — CONFIRMED";
        }
        else if (stageKey === "severity_agent") {
          desc = `Assigned critical severity index (${Number(severityScoreVal).toFixed(1)}/10) to ${locationText}. Identified dense urban heat island risk and power grid load-shedding.`;
          statusLabel = "";
        }
        else if (stageKey === "resource_allocation_agent") {
          desc = `Allocated 4 Hydration Camps, 4 Water Tankers, and 6 Shade Canopies to ${locationText} region.`;
          statusLabel = "";
        }
        else if (stageKey === "planning_agent") {
          desc = `In response to the extreme heat advisory in ${locationText}, a comprehensive action plan was initiated. Citizens received alerts regarding heat risks, while hydration camps were established in high-density areas and water tankers were routed to affected neighborhoods. Additionally, six shade canopies were activated as cooling centers, and five paramedic units were dispatched to assist those suffering from heat-related illnesses.`;
          statusLabel = "RESPONSE PLAN GENERATED";
        }
        else if (stageKey === "notification_agent") {
          desc = `All notifications have been successfully dispatched to the relevant stakeholders regarding the ongoing incident. This ensures that all parties are informed and can take necessary actions as required.`;
          statusLabel = "STAKEHOLDERS NOTIFIED";
        }
      } else {
        if (stageKey === "signal_agent") {
          desc = `Parsed unstructured mock telemetry signal in ${locationText}. Validated geographic boundaries and assigned an initial credibility index of 95% based on source cross-referencing.`;
          statusLabel = "SIGNAL PROCESSED";
        }
        else if (stageKey === "detection_agent") {
          desc = `Evaluated incoming signal location against historical datasets. Created a new active spatiotemporal cluster with verification triggers at ${locationText}.`;
          statusLabel = "CLUSTER CONFIRMED";
        }
        else if (stageKey === "verification_agent") {
          desc = `Scraped live Twitter/X crisis feeds and weather radar telemetry in real-time. Confirmed active flash floods with zero false alarms.`;
          statusLabel = "VERIFIED — CONFIRMED";
        }
        else if (stageKey === "severity_agent") {
          desc = `Assigned critical severity index (${Number(severityScoreVal).toFixed(1)}/10) to ${locationText}. Created verified incident in the central database.`;
          statusLabel = "";
        }
        else if (stageKey === "resource_allocation_agent") {
          desc = `Calculated vehicle requirements and dispatched 3 Rescue boats, 2 Ambulances to ${locationText} region.`;
          statusLabel = "";
        }
        else if (stageKey === "planning_agent") {
          desc = `Formulated action items: Dispatching rescue vehicles, setting up high-ground camps, closing low-lying bridges, and routing public traffic in ${locationText}.`;
          statusLabel = "RESPONSE PLAN GENERATED";
        }
        else if (stageKey === "notification_agent") {
          desc = `Triggered mass SMS/alert notifications to mobile devices inside the affected radius of ${locationText}.`;
          statusLabel = "STAKEHOLDERS NOTIFIED";
        }
      }
    }
    
    return { desc, statusLabel };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      <View style={StyleSheet.absoluteFill}>
        <AtmosphericBackground />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.iconButton}>
              <Home size={18} color={THEME.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MISSION REPORT</Text>
            <View style={{ width: 36 }} /> 
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successBanner}>
            <View style={styles.bannerIconContainer}>
              <ShieldCheck size={36} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <Text style={styles.successTitle}>SITUATION RESOLVED</Text>
            <Text style={[
              styles.successSubtitle, 
              incident?.disaster_type === "heatwave" && { color: "#F59E0B" }
            ]}>
              AGENTIC LOOP TERMINATED SUCCESSFULLY
            </Text>
          </View>

          {/* Impact Visualizer */}
          <View style={styles.chartCardContainer}>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <BarChart2 size={16} color={THEME.colors.text.muted} />
                <Text style={styles.chartTitle}>IMPACT REDUCTION ANALYSIS</Text>
              </View>
              <View style={styles.chartBody}>
                <View style={styles.barGroup}>
                  <View style={[styles.barFill, { height: `${bar1}%` }]} />
                  <Text style={styles.barLabel}>
                    {incident?.disaster_type === "heatwave" ? "STRESS" : "TRAFFIC"}
                  </Text>
                </View>
                <View style={styles.barGroup}>
                  <View style={[
                    styles.barFill, 
                    { 
                      backgroundColor: incident?.disaster_type === "heatwave" ? "#F59E0B" : THEME.colors.primary, 
                      height: `${bar2}%` 
                    }
                  ]} />
                  <Text style={styles.barLabel}>SAFETY</Text>
                </View>
                <View style={styles.barGroup}>
                  <View style={[styles.barFill, { height: `${bar3}%` }]} />
                  <Text style={styles.barLabel}>RESPONSE</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {incident?.disaster_type === "heatwave" ? (
              <>
                <View style={styles.statCard}>
                  <Home size={20} color={THEME.colors.primary} />
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>COOLING CENTERS ACTIVE</Text>
                </View>
                <View style={styles.statCard}>
                  <Activity size={20} color="#F59E0B" />
                  <Text style={styles.statValue}>46.5°C</Text>
                  <Text style={styles.statLabel}>PEAK HEAT INDEX</Text>
                </View>
              </>
            ) : (
              <>
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
              </>
            )}
            <View style={styles.statCard}>
              <Users size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>{incident?.estimated_population || "4.5K"}</Text>
              <Text style={styles.statLabel}>RESIDENTS PROTECTED</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={20} color={THEME.colors.text.secondary} />
              <Text style={styles.statValue}>{incident?.disaster_type === "heatwave" ? "30s" : "45s"}</Text>
              <Text style={styles.statLabel}>MEAN DETECTION TIME</Text>
            </View>
          </View>

          {/* Visual Route Rerouting Card */}
          <View style={styles.routeCardContainer}>
            <View style={styles.routeCard}>
              {incident?.disaster_type === "heatwave" ? (
                <>
                  <View style={styles.routeHeader}>
                    <Activity size={16} color="#F59E0B" />
                    <Text style={[styles.routeTitle, { color: "#F59E0B" }]}>ACTIVE SWARM COOLING NETWORK</Text>
                  </View>

                  {/* Graphical Layout for Heatwave */}
                  <View style={styles.diagramContainer}>
                    {/* Node A (Primary Station) */}
                    <View style={styles.nodeWrapper}>
                      <View style={[styles.nodeCircle, { backgroundColor: "#F59E0B", borderColor: "#ffffff" }]} />
                      <Text style={styles.nodeText}>Saddar Civic Staging Hub</Text>
                    </View>

                    {/* Vertical tracks */}
                    <View style={styles.tracksContainer}>
                      {/* Hydration Camp Pathway */}
                      <View style={styles.trackRow}>
                        <View style={[styles.solidLineGreen, { backgroundColor: "#14B8A6" }]} />
                        <View style={[styles.statusBadgeGreen, { backgroundColor: "#14B8A6" }]}>
                          <Text style={styles.badgeText}>💧 HYDRATION STATIONS ONLINE</Text>
                        </View>
                        <View style={[styles.solidLineGreen, { backgroundColor: "#14B8A6" }]} />
                      </View>

                      {/* Cooling Center Pathway */}
                      <View style={[styles.trackRow, { marginTop: 12 }]}>
                        <View style={[styles.solidLineGreen, { backgroundColor: "#10B981" }]} />
                        <View style={[styles.statusBadgeGreen, { backgroundColor: "#10B981" }]}>
                          <Text style={styles.badgeText}>🏢 COOLING CENTERS ESTABLISHED</Text>
                        </View>
                        <View style={[styles.solidLineGreen, { backgroundColor: "#10B981" }]} />
                      </View>
                    </View>

                    {/* Node B (Support Hub) */}
                    <View style={styles.nodeWrapper}>
                      <View style={[styles.nodeCircle, { backgroundColor: "#10B981", borderColor: "#ffffff" }]} />
                      <Text style={styles.nodeText}>Karachi South Medical Point</Text>
                    </View>
                  </View>

                  {/* Explainer Stats */}
                  <View style={styles.routeMetaGrid}>
                    <View style={styles.routeMetaCard}>
                      <Text style={styles.metaLabel}>SURGE CAPACITY</Text>
                      <Text style={styles.metaValue}>250 Persons/Hr</Text>
                    </View>
                    <View style={styles.routeMetaCard}>
                      <Text style={styles.metaLabel}>RESOURCES DEPLOYED</Text>
                      <Text style={styles.metaValue}>12 Smart Swarms</Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
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
                </>
              )}
            </View>
          </View>

          {/* Detailed Breakdown */}
          <View style={styles.reportCardContainer}>
            <View style={styles.reportCard}>
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
                  <Text style={styles.itemDescription}>
                    {incident?.disaster_type === "heatwave" 
                      ? "Specialized cooling wards established; local grid load-shedding bypassed."
                      : "Nearby hospitals and power grids remained operational throughout the event."}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sequential Agent Swarm Workflow Trace */}
          <View style={styles.timelineCardContainer}>
            <View style={styles.timelineCard}>
              <Text style={styles.timelineCardTitle}>SEQUENTIAL AGENT SWARM WORKFLOW TRACE</Text>
              
              <View style={styles.timelineContainer}>
                {STAGES.map((stage, idx) => {
                  const { desc, statusLabel } = getStageTrace(stage.key, idx);
                  const isLast = idx === STAGES.length - 1;
                  const isHeatwave = incident?.disaster_type === "heatwave";
                  
                  return (
                    <View key={stage.key} style={styles.timelineItem}>
                      {/* Timeline dot & vertical connector */}
                      <View style={styles.timelineLeft}>
                        <View style={[
                          styles.timelineDot,
                          { backgroundColor: isHeatwave ? "#F59E0B" : THEME.colors.primary }
                        ]} />
                        {!isLast && <View style={styles.timelineLine} />}
                      </View>
                      
                      {/* Step content */}
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeaderRow}>
                          <Text style={styles.timelineStepLabel}>
                            {idx + 1}. {stage.label.toUpperCase()}
                          </Text>
                          {statusLabel ? (
                            <View style={[
                              styles.statusBadge,
                              {
                                backgroundColor: statusLabel === "MONITORING"
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : isHeatwave
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : "rgba(20, 184, 166, 0.15)"
                              }
                            ]}>
                              <Text style={[
                                styles.statusBadgeText,
                                {
                                  color: statusLabel === "MONITORING"
                                    ? "#F59E0B"
                                    : isHeatwave
                                    ? "#F59E0B"
                                    : THEME.colors.primary
                                }
                              ]}>
                                {statusLabel}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.timelineDescription}>
                          {desc}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
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
    paddingVertical: THEME.spacing.xl,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.card,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surfaceSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
    fontWeight: "900",
  },
  content: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    alignItems: "center",
  },
  successBanner: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  bannerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.glow,
  },
  successTitle: {
    color: THEME.colors.text.primary,
    fontSize: 24,
    fontFamily: THEME.fonts.heading,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: "900",
  },
  successSubtitle: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    textAlign: "center",
    fontWeight: "800",
  },
  chartCardContainer: {
    width: "100%",
    borderRadius: THEME.borderRadius.xxl,
    overflow: "hidden",
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.premium,
  },
  chartCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: THEME.spacing.xl,
  },
  chartTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    fontWeight: "900",
  },
  chartBody: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    paddingBottom: 30,
    backgroundColor: THEME.colors.surfaceSoft,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  barGroup: {
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    width: 50,
  },
  barFill: {
    width: 32,
    backgroundColor: THEME.colors.text.secondary,
    borderRadius: 8,
  },
  barLabel: {
    color: THEME.colors.text.muted,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    marginTop: 12,
    position: "absolute",
    bottom: -24,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  statCard: {
    backgroundColor: THEME.colors.surface,
    width: (width - THEME.spacing.lg * 3) / 2,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: "hidden",
    ...THEME.shadows.card,
  },
  statValue: {
    color: THEME.colors.text.primary,
    fontSize: 24,
    fontFamily: THEME.fonts.heading,
    marginTop: THEME.spacing.md,
    fontWeight: "900",
  },
  statLabel: {
    color: THEME.colors.text.muted,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "700",
  },
  reportCardContainer: {
    width: "100%",
    borderRadius: THEME.borderRadius.xxl,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.premium,
  },
  reportCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
  },
  reportCardTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    marginBottom: THEME.spacing.xl,
    fontWeight: "900",
  },
  reportItem: {
    flexDirection: "row",
    gap: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  reportItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  reportItemContent: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    color: THEME.colors.text.primary,
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    marginBottom: 4,
    fontWeight: "800",
  },
  itemDescription: {
    color: THEME.colors.text.secondary,
    fontSize: 12,
    fontFamily: THEME.fonts.body,
    lineHeight: 18,
    fontWeight: "500",
  },
  doneButton: {
    backgroundColor: THEME.colors.primary,
    width: "100%",
    height: 64,
    borderRadius: THEME.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    ...THEME.shadows.premium,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 2,
  },
  routeCardContainer: {
    width: "100%",
    borderRadius: THEME.borderRadius.xxl,
    overflow: "hidden",
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.premium,
  },
  routeCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: THEME.spacing.xl,
  },
  routeTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    fontWeight: "900",
  },
  diagramContainer: {
    backgroundColor: THEME.colors.surfaceSoft,
    borderRadius: 20,
    padding: THEME.spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.xl,
  },
  nodeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  nodeCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#ffffff",
    ...THEME.shadows.glow,
  },
  nodeText: {
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    fontWeight: "800",
  },
  tracksContainer: {
    width: "100%",
    paddingVertical: 16,
    paddingLeft: 6,
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
    opacity: 0.4,
  },
  solidLineGreen: {
    flex: 1,
    height: 4,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  statusBadgeRed: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadgeGreen: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: THEME.fonts.mono,
    letterSpacing: 0.5,
  },
  routeMetaGrid: {
    flexDirection: "row",
    gap: THEME.spacing.lg,
  },
  routeMetaCard: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text.muted,
    fontWeight: "700",
  },
  metaValue: {
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.text.primary,
    marginTop: 6,
    fontWeight: "900",
  },
  timelineCardContainer: {
    width: "100%",
    borderRadius: THEME.borderRadius.xxl,
    overflow: "hidden",
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.premium,
  },
  timelineCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
  },
  timelineCardTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    marginBottom: THEME.spacing.xl,
    fontWeight: "900",
  },
  timelineContainer: {
    width: "100%",
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 100,
  },
  timelineLeft: {
    alignItems: "center",
    width: 28,
    marginRight: 12,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
    ...THEME.shadows.glow,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: THEME.colors.surfaceSoft,
    marginVertical: 6,
    opacity: 0.5,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineStepLabel: {
    color: THEME.colors.text.primary,
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    fontWeight: "900",
    letterSpacing: 1,
  },
  timelineDescription: {
    color: THEME.colors.text.secondary,
    fontSize: 12,
    fontFamily: THEME.fonts.body,
    lineHeight: 18,
    fontWeight: "500",
  },
});
