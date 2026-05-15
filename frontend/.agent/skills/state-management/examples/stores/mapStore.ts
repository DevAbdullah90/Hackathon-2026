import { create } from 'zustand';
import { Donor, MapMarker, DonorLocation } from '../../types/donor.types';
import { MapStoreState, MapRegion } from '../../types/store.types';

export const useMapStore = create<MapStoreState>((set) => ({
  userLocation: null,
  mapRegion: null,
  nearbyMarkers: [],
  selectedMarker: null,
  locationPermission: 'undetermined',
  isLocating: false,

  setUserLocation: (location) => set({ userLocation: location }),
  setMapRegion: (region) => set({ mapRegion: region }),
  setNearbyMarkers: (markers) => set({ nearbyMarkers: markers }),
  setSelectedMarker: (marker) => set({ selectedMarker: marker }),
  setLocationPermission: (status) => set({ locationPermission: status }),

  buildMarkersFromDonors: (donors) => {
    const markers: MapMarker[] = donors.map(d => ({
      id: `marker-${d.id}`,
      donorId: d.id,
      bloodGroup: d.bloodGroup,
      latitude: d.location.latitude,
      longitude: d.location.longitude,
      isAvailable: d.isAvailable
    }));
    set({ nearbyMarkers: markers });
  }
}));

// Default region for Karachi (24.8607, 67.0011) with sensible deltas.
// Markers are derived from donors to keep UI and data sources separate.
