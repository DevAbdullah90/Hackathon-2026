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
import { THEME } from "../lib/theme";

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

  const handleReportPress = () => {
    Alert.alert(
      "TRANSMIT TELEMETRY",
      "Select telemetry source to feed into the multi-agent orchestration pipeline:",
      [
        {
          text: "Civilian GPS Report",
          onPress: () => sendTelemetry("user_gps"),
        },
        {
          text: "Weather API (Auto-confirm)",
          onPress: () => sendTelemetry("weather_api"),
        },
        {
          text: "Traffic API (Auto-confirm)",
          onPress: () => sendTelemetry("traffic_api"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const sendTelemetry = async (source: string) => {
    setReporting(true);
    const success = await api.reportFlood(33.6844, 73.0479, source);
    setReporting(false);

    if (success) {
      Alert.alert("TELEMETRY INJECTED", `A simulated ${source} alert at coordinates [33.6844, 73.0479] has been fed into the multi-agent pipeline.`);
      fetchIncidents();
    } else {
      Alert.alert("Error", "Failed to submit telemetry report.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Live Flood Map</Text>
            <Text style={styles.headerSubtitle}>{incidents.length} Active Incidents</Text>
          </View>
          {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.mapCardTitle}>Flood Overview</Text>
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
            {reporting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.reportText}>🚨 Transmit Telemetry</Text>}
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

      <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={() => setIsModalVisible(false)}>
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
    backgroundColor: THEME.colors.background,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.glass,
    margin: 15,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
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
    color: THEME.colors.text.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: THEME.colors.text.muted,
    fontSize: 12,
  },
  mapCard: {
    marginHorizontal: 15,
    marginTop: 2,
    padding: 16,
    borderRadius: 24,
    backgroundColor: THEME.colors.glass,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
  mapCardTitle: {
    color: THEME.colors.text.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  mapCardSubtitle: {
    color: THEME.colors.text.muted,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  mapStage: {
    height: 372,
    borderRadius: 22,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: "hidden",
    position: "relative",
  },
  mapGridLines: {
    position: "absolute",
    inset: 0,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    marginTop: 70,
    marginBottom: 70,
  },
  mapGridLinesVertical: {
    position: "absolute",
    left: 140,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: THEME.colors.surfaceBorder,
  },
  pin: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 78, 59, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(6, 78, 59, 0.35)",
  },
  activePin: {
    backgroundColor: "rgba(220, 38, 38, 0.14)",
    borderColor: THEME.colors.status.critical,
  },
  mapNodeEmoji: {
    fontSize: 20,
  },
  mapInfoBubble: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 170,
    backgroundColor: THEME.colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    padding: 12,
  },
  mapInfoTitle: {
    color: THEME.colors.text.primary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  mapInfoText: {
    color: THEME.colors.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  reportContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  reportButton: {
    backgroundColor: THEME.colors.text.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  reportText: {
    color: THEME.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  bottomContainer: {
    paddingBottom: 8,
  },
  cardList: {
    paddingHorizontal: 15,
  },
  miniCard: {
    backgroundColor: THEME.colors.glass,
    width: width * 0.70,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
  activeCard: {
    borderColor: THEME.colors.primary,
    borderWidth: 2,
  },
  miniCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  miniCardTitle: {
    color: THEME.colors.text.primary,
    fontSize: 13,
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
    color: THEME.colors.text.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  reasoningBtn: {
    backgroundColor: "rgba(6, 78, 59, 0.08)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(6, 78, 59, 0.15)",
  },
  reasoningBtnText: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 50,
  },
  modalTitle: {
    color: THEME.colors.text.secondary,
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  closeEmoji: {
    fontSize: 20,
  },
});
