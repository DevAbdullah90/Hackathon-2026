import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  Alert,
  StatusBar,
} from "react-native";
import MapView, { Marker, Polygon, Polyline, Callout } from "react-native-maps";
import { CONFIG } from "./constants/config";

// --- Types ---

interface Incident {
  id: string;
  location: string;
  severity: number;
  confidence: number;
  status: string;
  lat: number;
  lng: number;
  affected_population: number;
  peak_eta: string;
  polygon: { latitude: number; longitude: number }[];
}

interface Resource {
  id: string;
  type: string;
  lat: number;
  lng: number;
  assigned: string;
}

interface FloodMapProps {
  navigation?: any;
}

// --- Mock Data (Karachi Focused) ---
// TODO: Replace MOCK_INCIDENTS with GET /api/v1/incidents/active
const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-001",
    location: "Gulshan-e-Iqbal, Karachi",
    severity: 9.0,
    confidence: 0.92,
    status: "confirmed",
    lat: 24.9180,
    lng: 67.0971,
    affected_population: 4500,
    peak_eta: "45 mins",
    polygon: [
      { latitude: 24.9200, longitude: 67.0950 },
      { latitude: 24.9250, longitude: 67.1000 },
      { latitude: 24.9150, longitude: 67.1050 },
      { latitude: 24.9100, longitude: 67.0980 },
    ],
  },
  {
    id: "INC-002",
    location: "North Nazimabad, Karachi",
    severity: 6.0,
    confidence: 0.75,
    status: "monitoring",
    lat: 24.9333,
    lng: 67.0333,
    affected_population: 2100,
    peak_eta: "1.5 hrs",
    polygon: [
      { latitude: 24.9350, longitude: 67.0300 },
      { latitude: 24.9400, longitude: 67.0350 },
      { latitude: 24.9300, longitude: 67.0400 },
      { latitude: 24.9250, longitude: 67.0320 },
    ],
  },
];

const MOCK_ROUTE = [
  { latitude: 24.8607, longitude: 67.0011 }, // Karachi Center
  { latitude: 24.8800, longitude: 67.0300 },
  { latitude: 24.9000, longitude: 67.0600 },
  { latitude: 24.9180, longitude: 67.0971 }, // To Gulshan
];

const MOCK_RESOURCES: Resource[] = [
  { id: "R1", type: "Rescue Unit 1", lat: 24.8700, lng: 67.0200, assigned: "INC-001" },
  { id: "R2", type: "Rescue Unit 2", lat: 24.8900, lng: 67.0500, assigned: "INC-001" },
  { id: "R3", type: "Drainage Crew", lat: 24.9300, lng: 67.0250, assigned: "INC-002" },
];

const { width, height } = Dimensions.get("window");

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

export default function FloodMap({ navigation }: FloodMapProps) {
  const mapRef = useRef<MapView>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animations
  const polygonOpacity = useRef(new Animated.Value(0)).current;
  const bottomCardTranslateY = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(polygonOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(bottomCardTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleIncidentPress = (incident: Incident) => {
    mapRef.current?.animateToRegion(
      {
        latitude: incident.lat,
        longitude: incident.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      1000
    );
  };

  const handleReportPress = () => {
    Alert.alert("Report Flood", "GPS location will be attached automatically", [{ text: "OK" }]);
  };

  const getSeverityColor = (severity: number, type: "fill" | "stroke") => {
    if (severity >= 7) {
      return type === "fill" ? "rgba(180,0,0,0.4)" : "rgba(180,0,0,1)";
    } else if (severity >= 4) {
      return type === "fill" ? "rgba(255,140,0,0.35)" : "rgba(255,140,0,1)";
    }
    return type === "fill" ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,1)";
  };

  const renderIncidentDetail = () => {
    if (!selectedIncident) return null;
    return (
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Incident Details</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeEmoji}>\u2716\ufe0f</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalId}>ID: {selectedIncident.id}</Text>
              <Text style={styles.modalLabel}>Location: <Text style={styles.modalValue}>{selectedIncident.location}</Text></Text>
              <Text style={styles.modalLabel}>Severity: <Text style={[styles.modalValue, { color: selectedIncident.severity >= 7 ? "#DC2626" : "#F59E0B" }]}>{selectedIncident.severity.toFixed(1)}</Text></Text>
              
              <Text style={styles.modalLabel}>Confidence Level:</Text>
              <View style={styles.confidenceBarBg}>
                <View style={[styles.confidenceBarFill, { width: `${selectedIncident.confidence * 100}%` }]} />
              </View>
              <Text style={styles.confidenceText}>{(selectedIncident.confidence * 100).toFixed(0)}% Accuracy</Text>

              <View style={styles.modalStatsRow}>
                <View>
                  <Text style={styles.modalLabel}>Affected Pop.</Text>
                  <Text style={styles.modalValue}>{selectedIncident.affected_population.toLocaleString()}</Text>
                </View>
                <View>
                  <Text style={styles.modalLabel}>Peak ETA</Text>
                  <Text style={styles.modalValue}>{selectedIncident.peak_eta}</Text>
                </View>
              </View>

              <Text style={styles.modalLabel}>Status: <Text style={styles.statusBadge}>{selectedIncident.status.toUpperCase()}</Text></Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={CONFIG.KARACHI_CENTER}
        showsUserLocation={true}
        mapType="standard"
      >
        {MOCK_INCIDENTS.map((incident) => (
          <AnimatedPolygon
            key={`poly-${incident.id}`}
            coordinates={incident.polygon}
            fillColor={getSeverityColor(incident.severity, "fill")}
            strokeColor={getSeverityColor(incident.severity, "stroke")}
            strokeWidth={2}
          />
        ))}

        <Polyline
          coordinates={MOCK_ROUTE}
          strokeColor="#00C851"
          strokeWidth={5}
          lineDashPattern={[10, 5]}
        />

        {MOCK_INCIDENTS.map((incident) => (
          <Marker
            key={`marker-${incident.id}`}
            coordinate={{ latitude: incident.lat, longitude: incident.lng }}
          >
            <Text style={styles.markerEmoji}>\ud83d\udea8</Text>
            <Callout
              onPress={() => {
                setSelectedIncident(incident);
                setIsModalVisible(true);
              }}
              style={styles.callout}
            >
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{incident.location}</Text>
                <Text style={styles.calloutSub}>Severity: {incident.severity.toFixed(1)}</Text>
                <Text style={styles.calloutSub}>Pop: {incident.affected_population}</Text>
                <Text style={styles.calloutStatus}>Status: {incident.status}</Text>
                <Text style={styles.tapDetail}>Tap for details \u2192</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {MOCK_RESOURCES.map((resource) => (
          <Marker
            key={`res-${resource.id}`}
            coordinate={{ latitude: resource.lat, longitude: resource.lng }}
            pinColor="blue"
          >
            <Callout style={styles.callout}>
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{resource.type}</Text>
                <Text style={styles.calloutSub}>Assigned: {resource.assigned}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.headerText}>\u2190</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>\ud83c\udf0a CIRO Live Map</Text>
            <Text style={styles.headerStatusText}>2 Active Incidents</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.reportButtonContainer}>
        <TouchableOpacity
          style={styles.reportButton}
          activeOpacity={0.8}
          onPress={handleReportPress}
        >
          <Text style={styles.reportButtonText}>\ud83d\udea8 Report Flood</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.bottomCardContainer,
          { transform: [{ translateY: bottomCardTranslateY }] },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {MOCK_INCIDENTS.map((incident) => (
            <TouchableOpacity
              key={`card-${incident.id}`}
              style={styles.incidentCard}
              onPress={() => handleIncidentPress(incident)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardLocation} numberOfLines={1}>
                  {incident.location}
                </Text>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: incident.severity >= 7 ? "#DC2626" : "#F59E0B" },
                  ]}
                >
                  <Text style={styles.severityText}>{incident.severity.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardInfo}>Confidence: {(incident.confidence * 100).toFixed(0)}%</Text>
                <Text style={styles.cardInfo}>Peak ETA: {incident.peak_eta}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {renderIncidentDetail()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitleText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerStatusText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  markerEmoji: {
    fontSize: 24,
  },
  callout: {
    width: 200,
    borderRadius: 10,
    padding: 10,
  },
  calloutContent: {
    backgroundColor: "white",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111827",
  },
  calloutSub: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 2,
  },
  calloutStatus: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "bold",
    marginTop: 2,
  },
  tapDetail: {
    fontSize: 10,
    color: "#2563EB",
    marginTop: 5,
    fontStyle: "italic",
  },
  reportButtonContainer: {
    position: "absolute",
    bottom: 140, // Above bottom card
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  reportButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomCardContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(17,24,39,0.95)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 30,
    elevation: 10,
    zIndex: 5,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  incidentCard: {
    backgroundColor: "#1F2937",
    width: width * 0.7,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLocation: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardInfo: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#111827",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeEmoji: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  modalBody: {
    marginBottom: 20,
  },
  modalId: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 10,
  },
  modalLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  modalValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  confidenceBarBg: {
    height: 8,
    backgroundColor: "#374151",
    borderRadius: 4,
    marginTop: 5,
    overflow: "hidden",
  },
  confidenceBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  confidenceText: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  modalStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  statusBadge: {
    color: "#DC2626",
    fontWeight: "bold",
  },
  modalCloseButton: {
    backgroundColor: "#374151",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
