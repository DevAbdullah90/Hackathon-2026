import { AppState, AppStateStatus } from 'react-native';
import { queryClient } from '../../utils/queryClient';
import { notificationStore } from '../../stores/notificationStore';
import { globalStore } from '../../stores/globalStore';
import { eventBus } from '../../eventBus';

/**
 * Return shape for the app state hook.
 */
export interface UseAppStateEventsReturn {
  appState: AppStateStatus;
  isActive: boolean;
}

/**
 * Custom hook that listens to AppState changes.
 * Refetches donors on foreground and stops location tracking in background.
 */
export function useAppStateEvents(): UseAppStateEventsReturn {
  const [appState, setAppState] = React.useState<AppStateStatus>(
    AppState.currentState
  );

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        setAppState(nextState);
        if (nextState === 'active') {
          // App came to foreground – refresh data.
          queryClient.invalidateQueries({ queryKey: ['donors', 'nearby'] });
          // Ensure session token is still valid.
          globalStore.refreshSessionIfNeeded();
          // Sync notification count.
          notificationStore.syncCount();
        } else if (nextState === 'background') {
          // Stop location tracking to save battery.
          eventBus.emit('stopLocationTracking');
          // Log background timestamp.
          console.log('App backgrounded at', new Date().toISOString());
        }
      }
    );
    return () => {
      // Cleanup listener on unmount.
      subscription.remove();
    };
  }, []);

  const isActive = appState === 'active';

  return { appState, isActive };
}

// NOTE: Refetching on foreground ensures donor list stays current; pausing location in background conserves battery on Pakistani devices.
