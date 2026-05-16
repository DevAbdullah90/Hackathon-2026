import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';

// TODO: Replace with GET /api/v1/incidents/{id}
const MOCK_OUTCOME = {
  incident_id: "INC-001",
  location: "Gulshan-e-Iqbal, Karachi",
  response_time: "45 seconds",
  vehicles_saved: 52,
  congestion_reduction: "62%",
  alerts_sent: 5200,
  community_status: "SAFE",
  actions: [
    { label:"Public Alerts", value:"5,200 users", icon:"🔔" },
    { label:"Traffic Rerouted", value:"240 vehicles", icon:"🚦" },
    { label:"Teams Dispatched", value:"2 rescue teams", icon:"🚒" }
  ],
  before: { congestion:"100%", blocked_roads:3, stranded:52 },
  after:  { congestion:"38%",  blocked_roads:0, stranded:0  }
};

export default function OutcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Mission Complete</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✅ COMMUNITY {MOCK_OUTCOME.community_status}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{MOCK_OUTCOME.vehicles_saved}</Text>
              <Text style={styles.statLabel}>Vehicles Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{MOCK_OUTCOME.congestion_reduction}</Text>
              <Text style={styles.statLabel}>Congestion Down</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{MOCK_OUTCOME.response_time.replace(' seconds', 's')}</Text>
              <Text style={styles.statLabel}>Response Time</Text>
            </View>
          </View>

          {/* Before vs After */}
          <View style={styles.comparisonContainer}>
            <Text style={styles.sectionTitle}>Impact Analysis</Text>
            <View style={styles.comparisonColumns}>
              <View style={[styles.comparisonCol, styles.beforeCol]}>
                <Text style={styles.colHeader}>BEFORE</Text>
                <Text style={styles.colText}>Congestion: {MOCK_OUTCOME.before.congestion}</Text>
                <Text style={styles.colText}>Blocked Roads: {MOCK_OUTCOME.before.blocked_roads}</Text>
                <Text style={styles.colText}>Stranded: {MOCK_OUTCOME.before.stranded}</Text>
              </View>
              <View style={[styles.comparisonCol, styles.afterCol]}>
                <Text style={styles.colHeader}>AFTER</Text>
                <Text style={styles.colText}>Congestion: {MOCK_OUTCOME.after.congestion}</Text>
                <Text style={styles.colText}>Blocked Roads: {MOCK_OUTCOME.after.blocked_roads}</Text>
                <Text style={styles.colText}>Stranded: {MOCK_OUTCOME.after.stranded}</Text>
              </View>
            </View>
          </View>

          {/* Completed Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Completed Actions</Text>
            {MOCK_OUTCOME.actions.map((action, index) => (
              <View key={index} style={styles.actionRow}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionValue}>{action.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Back to Dashboard */}
          <Link href="/" asChild>
            <TouchableOpacity style={styles.dashboardButton}>
              <Text style={styles.dashboardButtonText}>🏠 Back to Dashboard</Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
  },
  backButton: {
    padding: 8,
    width: 60,
  },
  backButtonText: {
    color: '#0A84FF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  badgeContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  badge: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#30D158',
  },
  badgeText: {
    color: '#30D158',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  comparisonColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonCol: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  beforeCol: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  afterCol: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  colHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  colText: {
    fontSize: 14,
    color: '#D1D1D6',
    marginBottom: 8,
  },
  actionsContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  dashboardButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
