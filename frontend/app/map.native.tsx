import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { CONFIG } from "../constants/config";
import { THEME } from "../lib/theme";
import { api, Incident } from "../lib/api";
import SeverityBadge from "../components/SeverityBadge";
import MapOverlay from "../components/MapOverlay";
import {
  ChevronLeft,
  MapPin,
  AlertCircle,
  Navigation,
  Activity,
  Users,
  Cpu,
  X,
  Target,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function FloodMapNative({ route, navigation }: any) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);

  const selectedIncidentId = route.params?.selectedIncidentId;

  const selectedCard = useMemo(() => {
    return selectedIncident ?? incidents[0] ?? null;
  }, [selectedIncident, incidents]);

  const fetchIncidents = async () => {
    const data = await api.getActiveIncidents();
    setIncidents(data);
    setLoading(false);

    if (selectedIncidentId && data.length > 0) {
      const incident = data.find((i) => i.id === selectedIncidentId);
      if (incident) {
        setSelectedIncident(incident);
      }
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [selectedIncidentId]);

  const handleIncidentPress = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleReportPress = async () => {
    setReporting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const coords =
        status === "granted"
          ? (await Location.getCurrentPositionAsync({})).coords
          : {
              latitude: CONFIG.ISLAMABAD_CENTER.latitude,
              longitude: CONFIG.ISLAMABAD_CENTER.longitude,
            };

      const success = await api.reportFlood(coords.latitude, coords.longitude);

      if (success) {
        Alert.alert(
          "SIGNAL TRANSMITTED",
          "Mock mobile signal routed into the crisis stream for demo mode.",
          [{ text: "OK", onPress: () => fetchIncidents() }]
        );
      } else {
        Alert.alert("COMMUNICATION ERROR", "Failed to transmit signal to command center.");
      }
    } catch (error) {
      Alert.alert("COMMUNICATION ERROR", "Failed to transmit signal to command center.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.mapStage}>
        <View style={styles.topGlow} />
        <View style={styles.gridLineH} />
        <View style={styles.gridLineV} />

        <SafeAreaView style={styles.overlay} pointerEvents="box-none">
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={THEME.colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>OPERATIONAL MAP</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: THEME.colors.status.success }]} />
                <Text style={styles.statusText}>{incidents.length} EVENTS TRACKED</Text>
              </View>
            </View>

            {loading && <ActivityIndicator color={THEME.colors.primary} size="small" />}
          </View>

          <View style={styles.mapZone}>
            <MapOverlay incidents={incidents} />

            {incidents.map((incident, index) => {
              const left = 8 + (index % 2) * 42 + index * 4;
              const top = 14 + index * 11;
              const isActive = selectedCard?.id === incident.id;

              return (
                <TouchableOpacity
                  key={incident.id}
                  style={[
                    styles.pin,
                    { left: `${left}%`, top: `${top}%` },
                    isActive && styles.activePin,
                  ]}
                  onPress={() => handleIncidentPress(incident)}
                  activeOpacity={0.85}
                >
                  <MapPin size={16} color="#FFF" />
                </TouchableOpacity>
              );
            })}

            <View style={styles.mapLegend}>
              <Text style={styles.legendTitle}>ISLAMABAD GRID</Text>
              <Text style={styles.legendText}>Tap a pin to inspect the incident zone.</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.reportFab, reporting && styles.disabledFab]}
            onPress={handleReportPress}
            disabled={reporting}
            activeOpacity={0.8}
          >
            {reporting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Navigation size={20} color="#FFF" />
                <Text style={styles.reportFabText}>TRANSMIT SIGNAL</Text>
              </>
            )}
          </TouchableOpacity>

          {incidents.length > 0 && (
            <View style={styles.bottomContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardList}
                snapToInterval={width * 0.8 + THEME.spacing.md}
                decelerationRate="fast"
              >
                {incidents.map((incident) => (
                  <TouchableOpacity
                    key={`card-${incident.id}`}
                    style={[styles.miniCard, selectedIncident?.id === incident.id && styles.activeCard]}
                    activeOpacity={0.9}
                    onPress={() => handleIncidentPress(incident)}
                  >
                    <View style={styles.miniCardTop}>
                      <Text style={styles.miniCardLocation} numberOfLines={1}>
                        {incident.location}
                      </Text>
                      <SeverityBadge score={incident.severity_score} />
                    </View>

                    <View style={styles.miniCardFooter}>
                      <View style={styles.miniCardStat}>
                        <Users size={12} color={THEME.colors.text.muted} />
                        <Text style={styles.miniCardStatText}>{incident.estimated_population}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.miniCardAction}
                        onPress={() => navigation.navigate("Reasoning", { incidentId: incident.id, location: incident.location })}
                      >
                        <Cpu size={14} color={THEME.colors.primary} />
                        <Text style={styles.miniCardActionText}>AI ANALYSIS</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </View>

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Activity size={16} color={THEME.colors.primary} />
                <Text style={styles.modalLabel}>CRISIS INTELLIGENCE</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalClose}>
                <X size={20} color={THEME.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {selectedIncident && (
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedIncident.location}</Text>

                <View style={styles.modalStatsRow}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>SEVERITY</Text>
                    <Text style={[styles.modalStatValue, { color: selectedIncident.severity_score > 7 ? THEME.colors.status.critical : THEME.colors.status.warning }]}>
                      {selectedIncident.severity_score.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>CONFIDENCE</Text>
                    <Text style={styles.modalStatValue}>{(selectedIncident.confidence * 100).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>IMPACT ETA</Text>
                    <Text style={styles.modalStatValue}>{selectedIncident.peak_impact_eta || "NOW"}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalPrimaryAction}
                  onPress={() => {
                    setIsModalVisible(false);
                    navigation.navigate("Reasoning", { incidentId: selectedIncident.id, location: selectedIncident.location });
                  }}
                >
                  <Cpu size={20} color="#FFF" />
                  <Text style={styles.modalActionText}>LAUNCH AI REASONING</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  mapStage: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    position: "relative",
  },
  topGlow: {
    position: "absolute",
    top: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(34, 211, 238, 0.12)",
  },
  gridLineH: {
    position: "absolute",
    top: 170,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    margin: THEME.spacing.md,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: THEME.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: THEME.colors.text.secondary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
  },
  mapZone: {
    flex: 1,
    marginHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.xl,
    backgroundColor: "#08101F",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: "hidden",
    minHeight: 300,
    position: "relative",
  },
  pin: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  activePin: {
    backgroundColor: "rgba(239, 68, 68, 0.22)",
    borderColor: THEME.colors.status.critical,
  },
  mapLegend: {
    position: "absolute",
    left: THEME.spacing.md,
    bottom: THEME.spacing.md,
    right: THEME.spacing.md,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
  },
  legendTitle: {
    color: THEME.colors.text.primary,
    fontFamily: THEME.fonts.subheading,
    fontSize: 12,
    letterSpacing: 1,
  },
  legendText: {
    color: THEME.colors.text.secondary,
    fontFamily: THEME.fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  reportFab: {
    position: "absolute",
    right: THEME.spacing.md,
    bottom: 160,
    backgroundColor: THEME.colors.status.critical,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.full,
    gap: 10,
    shadowColor: THEME.colors.status.critical,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  disabledFab: {
    opacity: 0.6,
  },
  reportFabText: {
    color: "#FFF",
    fontFamily: THEME.fonts.subheading,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  bottomContainer: {
    paddingBottom: 40,
  },
  cardList: {
    paddingHorizontal: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  miniCard: {
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    width: width * 0.8,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  activeCard: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  miniCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  },
  miniCardLocation: {
    color: THEME.colors.text.primary,
    fontSize: 16,
    fontFamily: THEME.fonts.subheading,
    flex: 1,
    marginRight: 10,
  },
  miniCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniCardStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniCardStatText: {
    color: THEME.colors.text.secondary,
    fontSize: 12,
    fontFamily: THEME.fonts.mono,
  },
  miniCardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  miniCardActionText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.subheading,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: THEME.spacing.xl,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  },
  modalHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalLabel: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
  modalClose: {
    padding: 4,
  },
  modalTitle: {
    color: THEME.colors.text.primary,
    fontSize: 24,
    fontFamily: THEME.fonts.heading,
    marginBottom: THEME.spacing.xl,
  },
  modalBody: {
    paddingTop: THEME.spacing.md,
  },
  modalStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 16,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xxl,
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatLabel: {
    color: THEME.colors.text.muted,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    marginBottom: 4,
  },
  modalStatValue: {
    color: THEME.colors.text.primary,
    fontSize: 18,
    fontFamily: THEME.fonts.heading,
  },
  modalPrimaryAction: {
    backgroundColor: THEME.colors.primary,
    height: 60,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  modalActionText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: THEME.fonts.subheading,
  },
});
