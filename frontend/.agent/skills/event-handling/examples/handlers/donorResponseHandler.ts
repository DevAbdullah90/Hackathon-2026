import { bloodRequestStore } from '../../stores/bloodRequestStore';
import { notificationStore } from '../../stores/notificationStore';
import { queryClient } from '../../utils/queryClient';

/**
 * Event interfaces for donor responses.
 */
export interface DonorAcceptedEvent {
  donorId: string;
  requestId: string;
  eta: number; // minutes until donor arrives
  donorName: string;
}

export interface DonorDeclinedEvent {
  donorId: string;
  requestId: string;
  reason?: string;
}

export type DonorResponseEvent = DonorAcceptedEvent | DonorDeclinedEvent;

/**
 * Handle a donor acceptance.
 * Updates request status, matched donors, shows notification, and invalidates the request query.
 */
export function handleDonorAccepted(event: DonorAcceptedEvent): void {
  // Update request status to indicate a donor is confirmed.
  bloodRequestStore.setRequestStatus(event.requestId, 'donor_confirmed');

  // Update matched donors list with the new donor information.
  bloodRequestStore.addMatchedDonor(event.requestId, {
    donorId: event.donorId,
    donorName: event.donorName,
    eta: event.eta,
  });

  // Notify the user.
  notificationStore.addNotification({
    type: 'donor_response',
    title: 'Donor Found!',
    message: `${event.donorName} is on the way. ETA: ${event.eta} mins`,
  });

  // Invalidate the TanStack query so the UI refetches the latest request data.
  queryClient.invalidateQueries({ queryKey: ['request', event.requestId] });
}

/**
 * Handle a donor decline.
 * Removes the donor from matched list, possibly reverts request status, and notifies the user.
 */
export function handleDonorDeclined(event: DonorDeclinedEvent): void {
  // Remove the donor from the matched donors list.
  bloodRequestStore.removeMatchedDonor(event.requestId, event.donorId);

  // If no donors remain matched, set request back to pending.
  if (bloodRequestStore.getMatchedDonors(event.requestId).length === 0) {
    bloodRequestStore.setRequestStatus(event.requestId, 'pending');
  }

  // Notify the user that a new donor search is underway.
  notificationStore.addNotification({
    type: 'donor_response',
    title: 'Finding Another Donor',
    message: 'Looking for available donors near you...',
  });

  // Invalidate the request query to refresh donor list.
  queryClient.invalidateQueries({ queryKey: ['request', event.requestId] });
}

/**
 * Type guard to differentiate accepted vs declined events.
 */
export function isDonorAccepted(
  e: DonorResponseEvent
): e is DonorAcceptedEvent {
  return 'eta' in e;
}

/**
 * Central dispatcher for donor response events.
 */
export function handleDonorResponse(event: DonorResponseEvent): void {
  if (isDonorAccepted(event)) {
    handleDonorAccepted(event);
  } else {
    handleDonorDeclined(event);
  }
}

/**
 * Sets up the listener for donor response events.
 * Returns a cleanup function to remove the listener and prevent memory leaks.
 */
export function setupDonorResponseListener(): () => void {
  import { eventBus } from '../../eventBus'; // Central event emitter for donor responses
  const subscription = eventBus.on('donorResponse', handleDonorResponse);
  // Cleanup removes the listener.
  return () => {
    subscription.remove();
  };
}

// NOTE: The type guard ensures we safely access `eta` only on accepted events.
// The cleanup function is returned so callers can detach the listener when a component unmounts,
// preventing memory leaks in the long‑running mobile app.
