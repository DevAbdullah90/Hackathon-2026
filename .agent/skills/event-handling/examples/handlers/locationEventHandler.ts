import * as Location from 'expo-location';
import { mapStore } from '../../stores/mapStore';
import { eventBus } from '../../eventBus';

/**
 * Coordinates returned by expo-location.
 */
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

/**
 * Permission status enumeration.
 */
export type LocationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined';

/**
 * Subscription object returned by watchPositionAsync.
 */
export interface LocationSubscription {
  remove: () => void;
}

/**
 * Requests foreground location permission and maps expo status to our enum.
 */
export async function requestLocationPermission():
  Promise<LocationPermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  let mapped: LocationPermissionStatus;
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      mapped = 'granted';
      break;
    case Location.PermissionStatus.DENIED:
      mapped = 'denied';
      break;
    default:
      mapped = 'undetermined';
  }
  mapStore.setLocationPermission(mapped);
  return mapped;
}

/**
 * Starts high‑accuracy location tracking with a 500 m distance interval.
 */
export async function startLocationTracking():
  Promise<LocationSubscription> {
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 500,
    },
    (location) => {
      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? null,
      };
      // Update store with latest position.
      mapStore.setUserLocation(coords);
      // If the user moved more than 500 m, refetch nearby donors.
      mapStore.checkIfMovedAndRefetch(coords);
    }
  );
  return subscription;
}

/**
 * Stops location tracking and resets permission to undetermined.
 */
export function stopLocationTracking(
  subscription: LocationSubscription
): void {
  subscription.remove();
  mapStore.setLocationPermission('undetermined');
}

/**
 * Retrieves a one‑time location fix.
 */
export async function getOneTimeLocation():
  Promise<LocationCoords> {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  const coords: LocationCoords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy ?? null,
  };
  mapStore.setUserLocation(coords);
  return coords;
}

/**
 * Hook exposing location state and controls.
 */
export function useLocationEvents() {
  const [userLocation, setUserLocation] = React.useState<LocationCoords | null>(
    null
  );
  const [locationPermission, setLocationPermission] = React.useState<
    LocationPermissionStatus
  >('undetermined');
  const [isLocating, setIsLocating] = React.useState(false);
  const subscriptionRef = React.useRef<LocationSubscription | null>(null);

  React.useEffect(() => {
    // Request permission on mount.
    requestLocationPermission().then((status) => {
      setLocationPermission(status);
      if (status === 'granted') {
        setIsLocating(true);
        startLocationTracking().then((sub) => {
          subscriptionRef.current = sub;
        });
      }
    });
    return () => {
      // Cleanup on unmount.
      if (subscriptionRef.current) {
        stopLocationTracking(subscriptionRef.current);
      }
    };
  }, []);

  const startTracking = async () => {
    if (locationPermission !== 'granted') {
      const status = await requestLocationPermission();
      setLocationPermission(status);
      if (status !== 'granted') return;
    }
    setIsLocating(true);
    const sub = await startLocationTracking();
    subscriptionRef.current = sub;
  };

  const stopTracking = () => {
    if (subscriptionRef.current) {
      stopLocationTracking(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    setIsLocating(false);
  };

  return {
    userLocation,
    locationPermission,
    isLocating,
    startTracking,
    stopTracking,
  } as const;
}

// NOTE: Distance interval of 500 m balances battery usage with donor‑proximity updates in Pakistan.
// Default map center is Karachi (24.8607, 67.0011) when no location is available.
