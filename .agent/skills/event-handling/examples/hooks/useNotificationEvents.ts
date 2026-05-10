import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { notificationStore } from '../../stores/notificationStore';
import { eventBus } from '../../eventBus';
import { handleEmergencyAlert } from '../handlers/emergencyAlertHandler';
import { handleDonorResponse } from '../handlers/donorResponseHandler';

/**
 * Shape of an FCM message payload.
 */
export interface FCMMessage {
  type: 'emergency' | 'donor_response' | 'request_update' | 'reminder';
  data: Record<string, unknown>;
  title?: string;
  body?: string;
}

/**
 * Return shape for the notification events hook.
 */
export interface UseNotificationEventsReturn {
  expoPushToken: string | null;
  notificationPermission: string;
  setupComplete: boolean;
}

/**
 * Request notification permissions from the user.
 */
export async function setupNotificationPermissions(): Promise<string> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/**
 * Register the device for push notifications and obtain the Expo push token.
 */
export async function registerPushToken(): Promise<string> {
  if (!Constants.isDevice) {
    throw new Error('Must use physical device for push notifications');
  }
  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const token = tokenResponse.data;
  // Send token to backend – placeholder implementation.
  await fetch('/api/users/push-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return token;
}

/**
 * Handle a foreground notification.
 */
export function handleForegroundNotification(
  notification: Notifications.Notification
): void {
  const raw = notification.request.content.data as Record<string, unknown>;
  const msg = raw as FCMMessage;
  if (!msg.type) return; // Guard against unknown payloads.
  switch (msg.type) {
    case 'emergency':
      // Delegate to emergency alert handler.
      if (isEmergencyMessage(msg)) {
        handleEmergencyAlert(msg.data as any);
      }
      break;
    case 'donor_response':
      if (isDonorResponseMessage(msg)) {
        handleDonorResponse(msg.data as any);
      }
      break;
    case 'request_update':
      // Update request status – placeholder.
      // Assume we have a requestStore with setRequestStatus.
      // requestStore.setRequestStatus(msg.data.requestId, msg.data.status);
      break;
    case 'reminder':
      notificationStore.addNotification({
        type: 'reminder',
        title: msg.title ?? 'Reminder',
        message: msg.body ?? '',
      });
      break;
    default:
      break;
  }
}

/**
 * Handle a notification tap when the app is in background or closed.
 */
export function handleNotificationTap(
  response: Notifications.NotificationResponse
): void {
  const raw = response.notification.request.content.data as Record<string, unknown>;
  const msg = raw as FCMMessage;
  if (!msg.type) return;
  switch (msg.type) {
    case 'emergency':
      // Navigate to emergency screen – placeholder navigation.
      // navigation.navigate('EmergencyScreen', { alertId: msg.data.id });
      break;
    case 'donor_response':
      // navigation.navigate('RequestStatusScreen', { requestId: msg.data.requestId });
      break;
    case 'request_update':
      // navigation.navigate('RequestStatusScreen', { requestId: msg.data.requestId });
      break;
    default:
      break;
  }
}

/**
 * Type guard for emergency messages.
 */
export function isEmergencyMessage(message: FCMMessage): boolean {
  return message.type === 'emergency' && typeof message.data.id === 'string';
}

/**
 * Type guard for donor response messages.
 */
export function isDonorResponseMessage(message: FCMMessage): boolean {
  return (
    message.type === 'donor_response' &&
    typeof (message.data as any).donorId === 'string'
  );
}

/**
 * Main hook that sets up notification listeners.
 */
export function useNotificationEvents(): UseNotificationEventsReturn {
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = React.useState<string>('undetermined');
  const [setupComplete, setSetupComplete] = React.useState(false);

  React.useEffect(() => {
    // Request permissions and register token.
    (async () => {
      const perm = await setupNotificationPermissions();
      setNotificationPermission(perm);
      if (perm !== 'granted') return;
      const token = await registerPushToken();
      setExpoPushToken(token);
    })();

    // Subscribe to foreground notifications.
    const foregroundSub = Notifications.addNotificationReceivedListener(
      handleForegroundNotification
    );
    // Subscribe to notification response (tap) events.
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      handleNotificationTap
    );

    setSetupComplete(true);
    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  return { expoPushToken, notificationPermission, setupComplete };
}

// NOTE: Two listeners are required because foreground notifications arrive via a different callback than background taps.
// FCM payloads are typed as `unknown`, so we guard before accessing fields.
