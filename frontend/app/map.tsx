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
      "TRANSMIT TELEMETRY",
      "Select telemetry source to feed into the multi-agent orchestration pipeline:",
      [
        { text: "Civilian GPS Report", onPress: () => sendTelemetry("user_gps") },
        { text: "Weather API (Auto-confirm)", onPress: () => sendTelemetry("weather_api") },
        { text: "Traffic API (Auto-confirm)", onPress: () => sendTelemetry("traffic_api") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const sendTelemetry = async (source: string) => {
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

      const success = await api.reportFlood(coords.latitude, coords.longitude, source);

      if (success) {
        Alert.alert(
          "TELEMETRY INJECTED",
          `A simulated ${source} alert at coordinates [${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}] has been fed into the multi-agent pipeline.`
        );
        fetchIncidents();
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
            <MapOverlay incidents={incidents} />

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
            <BlurView intensity={24} tint="light" style={styles.mapHeader}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <ChevronLeft size={20} color={THEME.colors.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>LIVE FLOOD MAP</Text>
                <Text style={styles.headerSubtitle}>Tap a marker to review details.</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: THEME.colors.primary }]} />
                  <Text style={styles.statusText}>{incidents.length} active incidents</Text>
                </View>
              </View>
              {loading && <ActivityIndicator color={THEME.colors.primary} size="small" />}
            </BlurView>
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
              <ActivityIndicator color={THEME.colors.primary} />
            ) : (
              <>
                <Navigation size={16} color={THEME.colors.primary} />
                <Text style={styles.reportFabText}>REPORT FLOOD</Text>
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
                    <BlurView
                      intensity={24}
                      tint="light"
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
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>

      <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={() => setIsModalVisible(false)}>
        <BlurView intensity={20} tint="light" style={styles.modalOverlay}>
          <BlurView intensity={50} tint="light" style={styles.modalContent}>
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
                  <Cpu size={18} color={THEME.colors.primary} />
                  <Text style={styles.modalActionText}>INITIALIZE ORCHESTRATOR</Text>
                </TouchableOpacity>
              </View>
            )}
          </BlurView>
        </BlurView>
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
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.borderRadius.md,
    gap: THEME.spacing.md,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 13,
    fontFamily: THEME.fonts.subheading,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.body,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
  contentSection: {
    flex: 0,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: 2,
    paddingBottom: 0,
  },
  reportButton: {
    minHeight: 44,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.accentSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.18)",
    marginBottom: 4,
  },
  reportFabText: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.subheading,
    fontSize: 10,
    letterSpacing: 1,
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
    backgroundColor: THEME.colors.background,
    width: width * 0.70,
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginHorizontal: 6,
  },
  activeCard: {
    borderColor: THEME.colors.primary,
  },
  miniCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  miniCardLocation: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    flex: 1,
    marginRight: 10,
    letterSpacing: 1,
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
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
  },
  miniCardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.colors.accentSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.18)",
  },
  miniCardActionText: {
    color: THEME.colors.primary,
    fontSize: 7,
    fontFamily: THEME.fonts.subheading,
    letterSpacing: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.background,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  markerSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  calloutContainer: {
    width: 140,
    padding: 10,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  calloutTitle: {
    color: THEME.colors.text.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.heading,
    marginBottom: 4,
    letterSpacing: 1,
  },
  calloutAction: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: THEME.borderRadius.lg,
    borderTopRightRadius: THEME.borderRadius.lg,
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
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 2,
  },
  modalClose: {
    padding: 4,
  },
  modalTitle: {
    color: THEME.colors.text.primary,
    fontSize: 20,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
    marginBottom: THEME.spacing.xl,
  },
  modalBody: {
    paddingTop: THEME.spacing.md,
  },
  modalStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.sm,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatLabel: {
    color: THEME.colors.text.muted,
    fontSize: 8,
    fontFamily: THEME.fonts.mono,
    marginBottom: 6,
    letterSpacing: 1,
  },
  modalStatValue: {
    color: THEME.colors.text.primary,
    fontSize: 16,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
  },
  modalPrimaryAction: {
    backgroundColor: THEME.colors.accentSoft,
    height: 56,
    borderRadius: THEME.borderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.18)",
  },
  modalActionText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
});
