import React, { useEffect, useState } from "react";
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
import SeverityBadge from "../components/SeverityBadge";
import { api, Incident } from "../lib/api";

const { width } = Dimensions.get("window");

export default function FloodMapWeb({ route, navigation }: any) {
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
        setSelectedIncident(incident);
      }
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedIncidentId]);

  const handleReportPress = async () => {
    setReporting(true);
    const success = await api.reportFlood(33.6844, 73.0479);
    setReporting(false);

    if (success) {
      Alert.alert("Flood Reported", "Mock GPS coordinates were queued for the demo.", [{ text: "OK" }]);
      fetchIncidents();
    } else {
      Alert.alert("Error", "Failed to submit mock report.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Live Crisis Map</Text>
            <Text style={styles.headerSubtitle}>{incidents.length} Active Incidents</Text>
          </View>
          {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.mapCardTitle}>Mock Crisis Map</Text>
          <Text style={styles.mapCardSubtitle}>Web fallback active. Native map is available on mobile builds.</Text>
          <View style={styles.mapStage}>
            <View style={styles.mapGridLines} />
            <View style={styles.mapGridLinesVertical} />
            {incidents.map((incident, index) => (
              <TouchableOpacity
                key={incident.id}
                style={[
                  styles.pin,
                  { top: 32 + (index % 2) * 120, left: 24 + (index * 118) % 220 },
                  selectedIncident?.id === incident.id && styles.activePin,
                ]}
                onPress={() => setSelectedIncident(incident)}
              >
                <Text style={styles.mapNodeEmoji}>📍</Text>
              </TouchableOpacity>
            ))}
            {selectedIncident ? (
              <View style={styles.mapInfoBubble}>
                <Text style={styles.mapInfoTitle}>{selectedIncident.location}</Text>
                <Text style={styles.mapInfoText}>Severity {selectedIncident.severity_score.toFixed(1)}/10</Text>
                <Text style={styles.mapInfoText}>Population {selectedIncident.estimated_population.toLocaleString()}</Text>
              </View>
            ) : (
              <View style={styles.mapInfoBubble}>
                <Text style={styles.mapInfoTitle}>Islamabad Flood Sector</Text>
                <Text style={styles.mapInfoText}>Select a pin to inspect the crisis zone.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.reportContainer}>
          <TouchableOpacity
            style={[styles.reportButton, reporting && styles.disabledButton]}
            onPress={handleReportPress}
            disabled={reporting}
          >
            {reporting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.reportText}>🚨 Report Flood at GPS</Text>}
          </TouchableOpacity>
        </View>

        {incidents.length > 0 && (
          <View style={styles.bottomContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardList}>
              {incidents.map((incident) => (
                <TouchableOpacity
                  key={`card-${incident.id}`}
                  style={[styles.miniCard, selectedIncident?.id === incident.id && styles.activeCard]}
                  onPress={() => setSelectedIncident(incident)}
                >
                  <View style={styles.miniCardHeader}>
                    <Text style={styles.miniCardTitle} numberOfLines={1}>
                      {incident.location}
                    </Text>
                    <SeverityBadge score={incident.severity_score} />
                  </View>
                  <View style={styles.miniCardFooter}>
                    <Text style={styles.miniCardInfo}>👥 {incident.estimated_population}</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Reasoning", { incidentId: incident.id, location: incident.location })}
                      style={styles.reasoningBtn}
                    >
                      <Text style={styles.reasoningBtnText}>AI Reasoning 🤖</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crisis Intelligence</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeEmoji}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    margin: 15,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  backText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
  },
  mapCard: {
    marginHorizontal: 15,
    marginTop: 4,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mapCardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  mapCardSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  mapStage: {
    height: 280,
    borderRadius: 22,
    backgroundColor: "#08101F",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
  },
  mapGridLines: {
    position: "absolute",
    inset: 0,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.12)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
    marginTop: 70,
    marginBottom: 70,
  },
  mapGridLinesVertical: {
    position: "absolute",
    left: 140,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
  },
  pin: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.55)",
  },
  activePin: {
    backgroundColor: "rgba(239, 68, 68, 0.22)",
    borderColor: "#EF4444",
  },
  mapNodeEmoji: {
    fontSize: 20,
  },
  mapInfoBubble: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 170,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 12,
  },
  mapInfoTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  mapInfoText: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 16,
  },
  reportContainer: {
    alignItems: "center",
    marginVertical: 18,
  },
  reportButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  reportText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  bottomContainer: {
    paddingBottom: 24,
  },
  cardList: {
    paddingHorizontal: 15,
  },
  miniCard: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    width: width * 0.75,
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeCard: {
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  miniCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  miniCardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  miniCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniCardInfo: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  reasoningBtn: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  reasoningBtnText: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 50,
  },
  modalTitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  closeEmoji: {
    fontSize: 20,
  },
});
