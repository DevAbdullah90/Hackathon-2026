import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from "react-native";
import SeverityBadge from "../components/SeverityBadge";

// --- Mock Data ---
// TODO: Replace mock data with real API call later
const MOCK_INCIDENTS = [
  {
    id: "INC-001",
    location: "Gulshan-e-Iqbal, Karachi",
    severity: 9.0,
    confidence: 92,
    time: "10:32 AM",
    affected: "4500",
    eta: "45 mins",
  },
  {
    id: "INC-002",
    location: "North Nazimabad, Karachi",
    severity: 6.0,
    confidence: 75,
    time: "10:45 AM",
    affected: "2100",
    eta: "1.5 hrs",
  },
];

interface DashboardProps {
  navigation: any;
}

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderIncidentCard = ({ item }: { item: typeof MOCK_INCIDENTS[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLocation}>{item.location}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <SeverityBadge score={item.severity} />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Confidence</Text>
          <Text style={styles.detailValue}>{item.confidence}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>👥 Affected</Text>
          <Text style={styles.detailValue}>{item.affected}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>⏱️ ETA</Text>
          <Text style={styles.detailValue}>{item.eta}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate("Map")}
        >
          <Text style={styles.secondaryButtonText}>🗺️ View on Map</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => console.log("AI Reasoning for", item.id)}
        >
          <Text style={styles.primaryButtonText}>🤖 AI Reasoning</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🌊 CIRO</Text>
          <Text style={styles.headerSubtitle}>Crisis Intelligence & Response</Text>
        </View>
        <View style={styles.liveIndicator}>
          <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Active{"\n"}Incidents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3/4</Text>
            <Text style={styles.statLabel}>Resources{"\n"}Deployed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5K</Text>
            <Text style={styles.statLabel}>Alerts{"\n"}Sent</Text>
          </View>
        </View>

        {/* Incidents Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Incidents</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>2</Text>
          </View>
        </View>

        {/* Incident List */}
        <FlatList
          data={MOCK_INCIDENTS}
          renderItem={renderIncidentCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Since it's inside a ScrollView
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabIcon, styles.activeTabIcon]}>🏠</Text>
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate("Map")}>
          <Text style={styles.tabIcon}>🗺️</Text>
          <Text style={styles.tabLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={styles.tabLabel}>Simulation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={styles.tabLabel}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#111827",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
    marginRight: 6,
  },
  liveText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1F2937",
    padding: 15,
    borderRadius: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#374151",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  countBadge: {
    backgroundColor: "#374151",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLocation: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  cardTime: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 15,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  detailRow: {
    alignItems: "center",
  },
  detailLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    marginBottom: 4,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  secondaryButton: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingBottom: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    justifyContent: "space-around",
  },
  tabItem: {
    alignItems: "center",
  },
  tabIcon: {
    fontSize: 20,
    color: "#9CA3AF",
  },
  tabLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "500",
  },
  activeTabIcon: {
    color: "#2563EB",
  },
  activeTabLabel: {
    color: "#2563EB",
  },
});

export default Dashboard;
