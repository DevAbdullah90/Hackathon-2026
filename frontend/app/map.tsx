import React, { useEffect, useRef, useState } from "react";
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
  Animated,
} from "react-native";
import Reanimated, { FadeInUp, FadeInDown, FadeIn } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { CONFIG } from "./constants/config";
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
  Target
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function FloodMap({ route, navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, [selectedIncidentId]);

  const handleIncidentPress = (incident: Incident) => {
    setSelectedIncident(incident);
    mapRef.current?.animateToRegion({
      latitude: incident.lat,
      longitude: incident.lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }, 1000);
  };

  const handleReportPress = async () => {
    setReporting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const coords = status === "granted" 
        ? (await Location.getCurrentPositionAsync({})).coords 
        : { latitude: CONFIG.ISLAMABAD_CENTER.latitude, longitude: CONFIG.ISLAMABAD_CENTER.longitude };

      const success = await api.reportFlood(coords.latitude, coords.longitude);

      if (success) {
        Alert.alert("SIGNAL TRANSMITTED", "Operational data has been sent to CIRO Orchestrator.");
        fetchIncidents();
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

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={CONFIG.ISLAMABAD_CENTER}
        showsUserLocation={true}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        customMapStyle={MAP_STYLE}
      >
        <MapOverlay incidents={incidents} />

        {incidents.map((incident) => (
          <Marker
            key={`marker-${incident.id}`}
            coordinate={{ latitude: incident.lat, longitude: incident.lng }}
            onPress={() => handleIncidentPress(incident)}
          >
            <Animated.View style={[
              styles.markerContainer, 
              { borderColor: incident.severity_score >= 7.5 ? THEME.colors.text.primary : THEME.colors.primary },
              selectedIncident?.id === incident.id && { transform: [{ scale: pulseAnim }] }
            ]}>
              <Target size={14} color={incident.severity_score >= 7.5 ? THEME.colors.text.primary : THEME.colors.primary} />
            </Animated.View>
            <Callout tooltip onPress={() => {
              setSelectedIncident(incident);
              setIsModalVisible(true);
            }}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{incident.location}</Text>
                <Text style={styles.calloutAction}>VIEW DATA \u2192</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <Reanimated.View entering={FadeInDown.delay(200).springify()} style={{ margin: THEME.spacing.md, borderRadius: THEME.borderRadius.md, overflow: "hidden" }}>
          <BlurView intensity={30} tint="dark" style={styles.header}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={20} color={THEME.colors.text.primary} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>TACTICAL MAP</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: THEME.colors.primary }]} />
                <Text style={styles.statusText}>{incidents.length} TARGETS ACQUIRED</Text>
              </View>
            </View>

            {loading && <ActivityIndicator color={THEME.colors.primary} size="small" />}
          </BlurView>
        </Reanimated.View>

        <Reanimated.View entering={FadeInUp.delay(300).springify()} style={[styles.reportFab, reporting && styles.disabledFab]}>
          <TouchableOpacity 
            onPress={handleReportPress}
            disabled={reporting}
            activeOpacity={0.8}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            {reporting ? (
              <ActivityIndicator color={THEME.colors.background} />
            ) : (
              <>
                <Navigation size={16} color={THEME.colors.background} />
                <Text style={styles.reportFabText}>TRANSMIT GPS</Text>
              </>
            )}
          </TouchableOpacity>
        </Reanimated.View>

        {incidents.length > 0 && (
          <Reanimated.View entering={FadeInUp.delay(400).springify()} style={styles.bottomContainer}>
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
                  activeOpacity={0.9}
                  onPress={() => handleIncidentPress(incident)}
                >
                  <BlurView intensity={40} tint="dark" style={[
                    styles.miniCard, 
                    selectedIncident?.id === incident.id && styles.activeCard
                  ]}>
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
                        <Cpu size={12} color={THEME.colors.background} />
                        <Text style={styles.miniCardActionText}>ENGAGE AI</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Reanimated.View>
        )}
      </SafeAreaView>

      <Modal 
        visible={isModalVisible} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setIsModalVisible(false)}
      >
        <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
          <BlurView intensity={50} tint="dark" style={styles.modalContent}>
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
                    <Text style={[
                      styles.modalStatValue, 
                      { color: selectedIncident.severity_score >= 7.5 ? THEME.colors.status.critical : THEME.colors.primary }
                    ]}>
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
                    navigation.navigate("Reasoning", { incidentId: selectedIncident.id, location: selectedIncident.location });
                  }}
                >
                  <Cpu size={18} color={THEME.colors.background} />
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

// Ultra dark map style
const MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#0a0a0a" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0a0a0a" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#171717" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#262626" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#262626" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.glass,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    gap: THEME.spacing.md,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: THEME.colors.text.primary,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusText: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontFamily: THEME.fonts.mono,
    letterSpacing: 1,
  },
  reportFab: {
    position: "absolute",
    right: THEME.spacing.md,
    bottom: 160,
    backgroundColor: THEME.colors.text.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.sm,
    gap: 8,
  },
  disabledFab: {
    opacity: 0.6,
  },
  reportFabText: {
    color: THEME.colors.background,
    fontFamily: THEME.fonts.heading,
    fontSize: 10,
    letterSpacing: 1,
  },
  bottomContainer: {
    paddingBottom: 40,
  },
  cardList: {
    paddingHorizontal: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  miniCard: {
    backgroundColor: THEME.colors.glass,
    width: width * 0.8,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
  activeCard: {
    borderColor: THEME.colors.primary,
  },
  miniCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  },
  miniCardLocation: {
    color: THEME.colors.text.primary,
    fontSize: 14,
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
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
  },
  miniCardActionText: {
    color: THEME.colors.background,
    fontSize: 9,
    fontFamily: THEME.fonts.heading,
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
  calloutContainer: {
    width: 140,
    padding: 10,
    backgroundColor: THEME.colors.surface,
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
    backgroundColor: "rgba(10, 10, 10, 0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.glass,
    borderTopLeftRadius: THEME.borderRadius.lg,
    borderTopRightRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.glassBorder,
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
    backgroundColor: THEME.colors.glass,
    borderRadius: THEME.borderRadius.sm,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
    backgroundColor: THEME.colors.primary,
    height: 56,
    borderRadius: THEME.borderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  modalActionText: {
    color: THEME.colors.background,
    fontSize: 12,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 2,
  },
});
