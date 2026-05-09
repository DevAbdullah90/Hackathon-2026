import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { globalStore } from '../../stores/globalStore';
import { queryClient } from '../../utils/queryClient';
import { showToast } from '../../utils/toast';

/**
 * Shape of the network state returned by the hook.
 */
export interface NetworkState {
  isOnline: boolean;
  connectionType: string | null;
  isWifi: boolean;
  isCellular: boolean;
}

/**
 * Return type of the network events hook.
 */
export interface UseNetworkEventsReturn extends NetworkState {
  checkConnection: () => Promise<void>;
}

/**
 * Hook that subscribes to network changes.
 */
export function useNetworkEvents(): UseNetworkEventsReturn {
  const [state, setState] = React.useState<NetworkState>({
    isOnline: true,
    connectionType: null,
    isWifi: false,
    isCellular: false,
  });

  const updateState = (netInfo: NetInfoState) => {
    const isOnline = netInfo.isConnected === true;
    const connectionType = netInfo.type ?? null;
    const isWifi = netInfo.type === 'wifi';
    const isCellular = netInfo.type === 'cellular';
    setState({ isOnline, connectionType, isWifi, isCellular });
    if (isOnline) {
      globalStore.setOnline(true);
      // Refetch all queries when back online.
      queryClient.invalidateQueries();
      showToast('Back online');
    } else {
      globalStore.setOnline(false);
    }
  };

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(updateState);
    // Initial fetch of current state.
    NetInfo.fetch().then(updateState);
    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    const current = await NetInfo.fetch();
    updateState(current);
  };

  return { ...state, checkConnection };
}

// NOTE: Rural Pakistan often experiences intermittent connectivity; the hook aids graceful degradation.
