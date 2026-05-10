export interface DonorStoreState {
  donors: Donor[];
  selectedDonor: Donor | null;
  availableDonors: Donor[];
  isLoading: boolean;
  lastFetched: number | null;
  setDonors: (donors: Donor[]) => void;
  setSelectedDonor: (donor: Donor | null) => void;
  filterAvailable: () => void;
  updateDonorStatus: (donorId: string, isAvailable: boolean) => void;
  clearDonors: () => void;
}

export interface BloodRequestStoreState {
  activeRequest: BloodRequest | null;
  requestHistory: BloodRequest[];
  requestStatus: RequestStatus | null;
  urgencyLevel: UrgencyLevel | null;
  matchedDonors: Donor[];
  isSubmitting: boolean;
  setActiveRequest: (request: BloodRequest) => void;
  setRequestStatus: (status: RequestStatus) => void;
  setUrgencyLevel: (level: UrgencyLevel) => void;
  setMatchedDonors: (donors: Donor[]) => void;
  addToHistory: (request: BloodRequest) => void;
  clearActiveRequest: () => void;
}

export interface MapStoreState {
  userLocation: DonorLocation | null;
  mapRegion: MapRegion | null;
  nearbyMarkers: MapMarker[];
  selectedMarker: MapMarker | null;
  locationPermission: 'granted' | 'denied' | 'undetermined';
  isLocating: boolean;
  setUserLocation: (location: DonorLocation) => void;
  setMapRegion: (region: MapRegion) => void;
  setNearbyMarkers: (markers: MapMarker[]) => void;
  setSelectedMarker: (marker: MapMarker | null) => void;
  setLocationPermission: (status: 'granted' | 'denied' | 'undetermined') => void;
  buildMarkersFromDonors: (donors: Donor[]) => void;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  lastAlert: Notification | null;
  isAlertVisible: boolean;
  addNotification: (notification: Notification) => void;
  markAllRead: () => void;
  markOneRead: (id: string) => void;
  setLastAlert: (alert: Notification) => void;
  showAlert: () => void;
  hideAlert: () => void;
  clearNotifications: () => void;
}

export type AppLanguage = 'en' | 'ur';

export interface GlobalStoreState {
  language: AppLanguage;
  isOnline: boolean;
  appVersion: string;
  isEmergencyMode: boolean;
  setLanguage: (lang: AppLanguage) => void;
  setOnline: (status: boolean) => void;
  toggleEmergencyMode: () => void;
}

// Store state interfaces enforce strict typing across the app.
