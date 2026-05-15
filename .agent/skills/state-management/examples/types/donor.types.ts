export type BloodGroup =
  'A+' | 'A-' | 'B+' | 'B-' |
  'AB+' | 'AB-' | 'O+' | 'O-';

export type DonorAvailability = 'available' | 'unavailable' | 'busy';

export interface DonorLocation {
  latitude: number;
  longitude: number;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  phone: string;
  isAvailable: boolean;
  availability: DonorAvailability;
  location: DonorLocation;
  lastDonation: string | null;
  trustScore: number;
  totalDonations: number;
}

export interface MapMarker {
  id: string;
  donorId: string;
  bloodGroup: BloodGroup;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
}

// BloodGroup is a union type to ensure only valid groups are used.
// DonorAvailability captures three realistic states for a donor.
// Pakistan cities context: donors are located across major cities such as Karachi, Lahore, Islamabad, Peshawar, Quetta.
