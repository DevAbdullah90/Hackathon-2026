import { useDonorStore } from '../stores/donorStore';
import { useBloodRequestStore } from '../stores/bloodRequestStore';
import { useMapStore } from '../stores/mapStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useGlobalStore } from '../stores/globalStore';
import { DonorStoreState, BloodRequestStoreState, MapStoreState, NotificationStoreState, GlobalStoreState } from '../../types/store.types';

export interface AllStores {
  donor: DonorStoreState;
  request: BloodRequestStoreState;
  map: MapStoreState;
  notification: NotificationStoreState;
  global: GlobalStoreState;
}

export const useStores = (): AllStores => ({
  donor: useDonorStore.getState(),
  request: useBloodRequestStore.getState(),
  map: useMapStore.getState(),
  notification: useNotificationStore.getState(),
  global: useGlobalStore.getState()
});

export const useLogoutAllStores = () => () => {
  useDonorStore.getState().clearDonors();
  useBloodRequestStore.getState().clearActiveRequest();
  useNotificationStore.getState().clearNotifications();
  // Reset map store to initial state
  useMapStore.getState().setUserLocation(null);
  useMapStore.getState().setMapRegion(null);
  useMapStore.getState().setNearbyMarkers([]);
  useMapStore.getState().setSelectedMarker(null);
  useMapStore.getState().setLocationPermission('undetermined');
  useMapStore.getState().setUserLocation(null);
};

// useStores returns a snapshot of all store states for easy consumption.
// useLogoutAllStores clears all state on user logout to avoid data leakage.
