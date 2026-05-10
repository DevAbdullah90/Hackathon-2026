export type UrgencyLevel = 'critical' | 'urgent' | 'normal';

export type RequestStatus =
  'pending' | 'matched' | 'donor_confirmed' |
  'in_progress' | 'fulfilled' | 'cancelled';

export interface BloodRequest {
  id: string;
  bloodGroup: BloodGroup;
  urgency: UrgencyLevel;
  hospital: string;
  city: string;
  patientCondition: string;
  contactPhone: string;
  status: RequestStatus;
  matchedDonors: Donor[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBloodRequestPayload {
  bloodGroup: BloodGroup;
  urgency: UrgencyLevel;
  hospital: string;
  city: string;
  patientCondition: string;
  contactPhone: string;
}

export interface Notification {
  id: string;
  type: 'emergency' | 'donor_response' | 'request_update' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// Status flow: pending → matched → donor_confirmed → in_progress → fulfilled.
// Types reuse BloodGroup from donor.types.ts and Donor for matched donors.
