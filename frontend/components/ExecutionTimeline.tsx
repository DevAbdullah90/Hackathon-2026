import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TimelineEvent {
  id: string;
  stage: 'PENDING' | 'SENT' | 'ACTIVE' | 'ON_SITE' | 'COMPLETED';
  label: string;
  timeOffset: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

const STAGES: TimelineEvent[] = [
  {
    id: '1',
    stage: 'PENDING',
    label: 'Incident Detected',
    timeOffset: 'T+0s',
    description: 'Signal received and verified by CIRO-Agent.',
    status: 'completed',
  },
  {
    id: '2',
    stage: 'SENT',
    label: 'Alert Dispatched',
    timeOffset: 'T+15s',
    description: 'Emergency response units notified via secure channel.',
    status: 'completed',
  },
  {
    id: '3',
    stage: 'ACTIVE',
    label: 'Units En Route',
    timeOffset: 'T+30s',
    description: 'Resource tracking active. Rerouting traffic for priority access.',
    status: 'current',
  },
  {
    id: '4',
    stage: 'ON_SITE',
    label: 'On-Site Response',
    timeOffset: 'T+60s',
    description: 'Ground units deployed. Rescue operations initiated.',
    status: 'upcoming',
  },
  {
    id: '5',
    stage: 'COMPLETED',
    label: 'Incident Resolved',
    timeOffset: 'T+120s',
    description: 'Water levels stabilized. All residents accounted for.',
    status: 'upcoming',
  },
];

const ExecutionTimeline = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="time-outline" size={26} color="#F472B6" />
        <Text style={styles.headerTitle}>Execution Timeline</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {STAGES.map((event, index) => (
          <View key={event.id} style={styles.stepRow}>
            
            {/* Timeline Indicator */}
            <View style={styles.timelineColumn}>
              <View style={[
                styles.dot,
                event.status === 'completed' && styles.completedDot,
                event.status === 'current' && styles.currentDot,
                event.status === 'upcoming' && styles.upcomingDot
              ]}>
                <Ionicons 
                  name={
                    event.status === 'completed' ? 'checkmark' :
                    event.status === 'current' ? 'play' : 'ellipse-outline'
                  } 
                  size={18} 
                  color={
                    event.status === 'completed' ? '#34D399' :
                    event.status === 'current' ? '#60A5FA' : '#64748B'
                  } 
                />
              </View>
              {index !== STAGES.length - 1 && <View style={styles.line} />}
            </View>

            {/* Content Card */}
            <View style={[
              styles.card,
              event.status === 'current' && styles.currentCard,
              event.status === 'completed' && styles.completedCard
            ]}>
              <View style={styles.cardHeader}>
                <Text style={[
                  styles.label,
                  event.status === 'completed' && styles.completedLabel,
                  event.status === 'current' && styles.currentLabel
                ]}>
                  {event.label}
                </Text>
                <Text style={styles.timeOffset}>{event.timeOffset}</Text>
              </View>

              <Text style={styles.description}>{event.description}</Text>

              {event.status === 'current' && (
                <View style={styles.inProgressBadge}>
                  <View style={styles.inProgressDot} />
                  <Text style={styles.inProgressText}>IN PROGRESS</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },

  stepRow: {
    flexDirection: 'row',
    marginBottom: 36,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 44,
    marginRight: 16,
  },
  dot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#334155',
  },
  completedDot: { borderColor: '#34D399', backgroundColor: '#052E16' },
  currentDot: { borderColor: '#60A5FA', backgroundColor: '#0F172A' },
  upcomingDot: { borderColor: '#475569' },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
    marginTop: 8,
  },

  card: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  completedCard: { borderColor: '#34D39920' },
  currentCard: { 
    backgroundColor: '#172554', 
    borderColor: '#60A5FA30' 
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  completedLabel: { color: '#34D399' },
  currentLabel: { color: '#60A5FA' },
  timeOffset: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#CBD5E1',
  },
  inProgressBadge: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#60A5FA30',
  },
  inProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60A5FA',
    marginRight: 6,
  },
  inProgressText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ExecutionTimeline;