import { notificationStore } from '../../stores/notificationStore';
import { globalStore } from '../../stores/globalStore';
import { Vibration } from 'react-native';
import { eventBus } from '../../eventBus';

/**
 * Types for emergency alert data.
 */
export interface EmergencyAlertData {
  id: string;
  bloodGroup: string; // e.g., 'A+', 'O-'
  hospital: string;
  city: string;
  urgency: 'critical' | 'high' | 'moderate';
  patientCondition: string;
  contactPhone: string;
  postedAt: string; // ISO timestamp
}

/**
 * Reason why an emergency alert was dismissed.
 */
export type EmergencyDismissReason =
  | 'user_dismissed'
  | 'request_fulfilled'
  | 'timeout';

/**
 * Handles an incoming emergency alert.
 */
export function handleEmergencyAlert(alert: EmergencyAlertData): void {
  // Add a notification for the user.
  notificationStore.addNotification({
    type: 'emergency',
    title: 'Emergency Blood Needed',
    message: `${alert.bloodGroup} required at ${alert.hospital} (${alert.city})`,
  });

  // Store the latest alert for quick access.
  notificationStore.setLastAlert(alert);
  notificationStore.showAlert();

  // If the alert is critical, enable emergency mode and vibrate the device.
  if (alert.urgency === 'critical') {
    globalStore.toggleEmergencyMode(true);
    Vibration.vibrate([500, 200, 500, 200, 500]);
  }
}

/**
 * Dismisses the current emergency alert.
 */
export function dismissEmergencyAlert(reason: EmergencyDismissReason): void {
  globalStore.toggleEmergencyMode(false);
  notificationStore.hideAlert();
  // Log the dismissal reason for analytics.
  console.log('Emergency alert dismissed:', reason);
}

/**
 * Type guard to verify a payload matches EmergencyAlertData.
 */
export function isEmergencyFCMMessage(
  data: Record<string, unknown>
): data is EmergencyAlertData {
  return (
    typeof data.id === 'string' &&
    typeof data.bloodGroup === 'string' &&
    typeof data.hospital === 'string' &&
    typeof data.city === 'string' &&
    (data.urgency === 'critical' || data.urgency === 'high' || data.urgency === 'moderate') &&
    typeof data.patientCondition === 'string' &&
    typeof data.contactPhone === 'string' &&
    typeof data.postedAt === 'string'
  );
}

/**
 * Sets up the listener for emergency FCM messages.
 * Returns a cleanup function to deregister the listener.
 */
export function setupEmergencyListener(): () => void {
  const subscription = eventBus.on('fcmMessage', (payload: any) => {
    if (payload.type === 'emergency' && isEmergencyFCMMessage(payload)) {
      handleEmergencyAlert(payload);
    }
  });
  return () => {
    subscription.remove();
  };
}

// Context: Pakistani hospitals like Aga Khan and Jinnah are common sites for emergencies.
// Vibration is only triggered for critical alerts to avoid unnecessary disruption for less urgent cases.
