import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { CONFIG } from "../constants/config";
import { THEME } from "../lib/theme";
import { api, Incident } from "../lib/api";
import SeverityBadge from "../components/SeverityBadge";
import MapOverlay from "../components/MapOverlay";
import {
  ChevronLeft,
  Navigation,
  Activity,
  Users,
  Cpu,
  X,
  Target,
  Sun,
  Flame,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function FloodMap({ route, navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);

  const selectedIncidentId = route.params?.selectedIncidentId;

  const fetchIncidents = async () => {
    const data = await api.getActiveIncidents();
    setIncidents(data);
    setLoading(false);

    if (selectedIncidentId && data.length > 0) {
      const incident = data.find((i) => i.id === selectedIncidentId);
      if (incident) {
        setTimeout(() => handleIncidentPress(incident), 500);
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
    mapRef.current?.animateToRegion(
      {
        latitude: incident.lat,
        longitude: incident.lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      0
    );
  };

  const handleReportPress = () => {
    Alert.alert(
      "REPORT EMERGENCY SIGNAL",
      "Select the emergency category you want to report:",
      [
        {
          text: "Flood Crisis 🌊",
          onPress: () => promptTelemetrySource("flood")
        },
        {
          text: "Extreme Heatwave 🔥",
          onPress: () => promptTelemetrySource("heatwave")
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const promptTelemetrySource = (disasterType: string) => {
    const typeLabel = disasterType === "heatwave" ? "Extreme Heatwave" : "Flood Crisis";
    Alert.alert(
      "TRANSMIT TELEMETRY",
      `Select telemetry source to feed into the multi-agent pipeline for ${typeLabel}:`,
      [
        { text: "Civilian GPS Report", onPress: () => sendTelemetry("user_gps", disasterType) },
        { text: "Weather Station Radar", onPress: () => sendTelemetry("weather_station", disasterType) },
        { text: "Municipal Sensor / IoT", onPress: () => sendTelemetry("sensor", disasterType) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const sendTelemetry = async (source: string, disasterType: string = "flood") => {
    setReporting(true);
    try {
      let coords = {
        latitude: CONFIG.ISLAMABAD_CENTER.latitude,
        longitude: CONFIG.ISLAMABAD_CENTER.longitude,
      };

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = position.coords;
        }
      } catch (locError) {
        console.log("GPS position fetch timed out or failed, using default coordinates:", locError);
      }

      const res = await api.reportFlood(coords.latitude, coords.longitude, source, disasterType);

      if (res && res.signal_id) {
        Alert.alert(
          "TELEMETRY INJECTED",
          `A simulated ${disasterType} alert from source '${source}' at coordinates [${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}] has been fed into the multi-agent pipeline. Launching triage tracker...`,
          [
            {
              text: "Launch Triage Tracker",
              onPress: () => {
                navigation.navigate("Processing", { signalId: res.signal_id });
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("TRANSMISSION FAILED", "Failed to feed signal to command center.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mapSection}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={CONFIG.ISLAMABAD_CENTER}
            showsUserLocation
            mapType="standard"
            userInterfaceStyle="light"
          >
            <MapOverlay incidents={incidents} selectedIncident={selectedIncident} />

            {incidents.map((incident) => (
              <Marker
                key={`marker-${incident.id}`}
                coordinate={{ latitude: incident.lat, longitude: incident.lng }}
                onPress={() => handleIncidentPress(incident)}
              >
                <View
                  style={[
                    styles.markerContainer,
                    {
                      borderColor:
                        incident.severity_score >= 7.5 ? THEME.colors.text.primary : THEME.colors.primary,
                    },
                    selectedIncident?.id === incident.id && styles.markerSelected,
                  ]}
                >
                  <Target
                    size={14}
                    color={incident.severity_score >= 7.5 ? THEME.colors.text.primary : THEME.colors.primary}
                  />
                </View>
                <Callout
                  tooltip
                  onPress={() => {
                    setSelectedIncident(incident);
                    setIsModalVisible(true);
                  }}
                >
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{incident.location}</Text>
                    <Text style={styles.calloutAction}>VIEW DATA →</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <View style={styles.mapHeaderWrap}>
            <View style={styles.mapHeader}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <ChevronLeft size={20} color={THEME.colors.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>LIVE CRISIS MAP</Text>
                <Text style={styles.headerSubtitle}>Tap a marker to review details.</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: THEME.colors.primary }]} />
                  <Text style={styles.statusText}>{incidents.length} active incidents</Text>
                </View>
              </View>
              {loading && <ActivityIndicator color={THEME.colors.primary} size="small" />}
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <TouchableOpacity
            onPress={handleReportPress}
            disabled={reporting}
            activeOpacity={0.85}
            style={[styles.reportButton, reporting && styles.disabledFab]}
          >
            {reporting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.reportFabText}>REPORT CRISIS</Text>
              </>
            )}
          </TouchableOpacity>

          {incidents.length > 0 && (
            <View style={styles.cardsWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardList}
                snapToInterval={width * 0.75 + 16}
                decelerationRate="fast"
              >
                {incidents.map((incident) => (
                  <TouchableOpacity
                    key={`card-${incident.id}`}
                    activeOpacity={0.9}
                    onPress={() => handleIncidentPress(incident)}
                  >
                    <View
                      style={[
                        styles.miniCard,
                        selectedIncident?.id === incident.id && styles.activeCard,
                      ]}
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
                          onPress={() =>
                            navigation.navigate("Reasoning", {
                              incidentId: incident.id,
                              location: incident.location,
                            })
                          }
                        >
                          <Cpu size={12} color={THEME.colors.primary} />
                          <Text style={styles.miniCardActionText}>OPEN DETAILS</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>

      <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Activity size={14} color={THEME.colors.primary} />
                <Text style={styles.modalLabel}>TARGET INTEL</Text>
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
                    <Text
                      style={[
                        styles.modalStatValue,
                        {
                          color:
                            selectedIncident.severity_score >= 7.5
                              ? THEME.colors.status.critical
                              : THEME.colors.primary,
                        },
                      ]}
                    >
                      {selectedIncident.severity_score.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>CONFIDENCE</Text>
                    <Text style={styles.modalStatValue}>{(selectedIncident.confidence * 100).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>IMPACT</Text>
                    <Text style={styles.modalStatValue}>{selectedIncident.peak_impact_eta || "NOW"}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalPrimaryAction}
                  onPress={() => {
                    setIsModalVisible(false);
                    navigation.navigate("Reasoning", {
                      incidentId: selectedIncident.id,
                      location: selectedIncident.location,
                    });
                  }}
                >
                  <Cpu size={18} color="#FFFFFF" />
                  <Text style={styles.modalActionText}>INITIALIZE ORCHESTRATOR</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  mapSection: {
    height: "72%",
    position: "relative",
    backgroundColor: THEME.colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapHeaderWrap: {
    position: "absolute",
    top: THEME.spacing.md,
    left: THEME.spacing.md,
    right: THEME.spacing.md,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.xxl,
    gap: THEME.spacing.lg,
    ...THEME.shadows.premium,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 16,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: THEME.colors.text.muted,
    fontSize: 11,
    fontFamily: THEME.fonts.body,
    marginBottom: 8,
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
    fontWeight: "800",
  },
  contentSection: {
    flex: 0,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: 10,
    paddingBottom: 20,
  },
  reportButton: {
    minHeight: 56,
    borderRadius: THEME.borderRadius.xl,
    backgroundColor: THEME.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    ...THEME.shadows.premium,
    marginBottom: THEME.spacing.lg,
  },
  reportFabText: {
    color: "#FFFFFF",
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1.5,
  },
  disabledFab: {
    opacity: 0.6,
  },
  cardsWrap: {
    flexGrow: 0,
  },
  cardList: {
    paddingHorizontal: 15,
    paddingBottom: 0,
  },
  miniCard: {
    backgroundColor: THEME.colors.surface,
    width: width * 0.75,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginHorizontal: 8,
    ...THEME.shadows.premium,
  },
  activeCard: {
    borderColor: THEME.colors.primary,
    borderWidth: 2,
  },
  miniCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.md,
  },
  miniCardLocation: {
    color: THEME.colors.text.primary,
    fontSize: 15,
    fontFamily: THEME.fonts.heading,
    flex: 1,
    marginRight: 10,
    letterSpacing: 0.5,
    fontWeight: "900",
  },
  miniCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniCardStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  miniCardStatText: {
    color: THEME.colors.text.primary,
    fontSize: 11,
    fontFamily: THEME.fonts.mono,
    fontWeight: "800",
  },
  miniCardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.15)",
  },
  miniCardActionText: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 1,
    fontWeight: "900",
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    ...THEME.shadows.card,
  },
  markerSelected: {
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    transform: [{ scale: 1.15 }],
  },
  calloutContainer: {
    width: 160,
    padding: 12,
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.card,
  },
  calloutTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    marginBottom: 6,
    letterSpacing: 0.5,
    fontWeight: "900",
  },
  calloutAction: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xxl,
    borderTopRightRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.premium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.xl,
  },
  modalHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalLabel: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
    fontWeight: "800",
  },
  modalClose: {
    padding: 6,
    backgroundColor: THEME.colors.surfaceSoft,
    borderRadius: 12,
  },
  modalTitle: {
    color: THEME.colors.text.primary,
    fontSize: 24,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 0.5,
    marginBottom: THEME.spacing.xl,
    fontWeight: "900",
  },
  modalBody: {
    paddingTop: THEME.spacing.md,
  },
  modalStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: THEME.colors.surfaceSoft,
    borderRadius: 20,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatLabel: {
    color: THEME.colors.text.muted,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: "700",
  },
  modalStatValue: {
    color: THEME.colors.text.primary,
    fontSize: 20,
    fontFamily: THEME.fonts.mono,
    fontWeight: "900",
  },
  modalPrimaryAction: {
    backgroundColor: THEME.colors.primary,
    height: 64,
    borderRadius: THEME.borderRadius.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    ...THEME.shadows.premium,
  },
  modalActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: THEME.fonts.heading,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
