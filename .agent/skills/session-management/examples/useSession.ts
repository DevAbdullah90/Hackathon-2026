import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import SecureStore from 'expo-secure-store';
import { getSession, isTokenExpired, refreshToken, clearSession } from './sessionService';
import { useSessionStore } from './sessionStore';
import type { User } from './sessionStore';

export interface UseSessionReturn {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  logout: () => Promise<void>;
}

/** Hook that initializes session on mount and provides logout */
export function useSession(): UseSessionReturn {
  const navigation = useNavigation();
  const {
    user,
    token,
    isLoggedIn,
    isLoading,
    sessionChecked,
    setSession,
    clearSession: clearStore,
    setLoading,
    setSessionChecked,
  } = useSessionStore();

  const performLogout = useCallback(async () => {
    await clearSession();
    clearStore();
    navigation.navigate('Login' as never);
  }, [clearStore, navigation]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const stored = await getSession();
      if (stored) {
        const { token: storedToken, user: storedUser } = stored;
        if (!isTokenExpired(storedToken)) {
          setSession(storedUser, storedToken);
        } else {
          try {
            const newToken = await refreshToken(storedToken);
            setSession(storedUser, newToken);
            // Persist refreshed token
            await SecureStore.setItemAsync('bl_token', newToken);
          } catch {
            await performLogout();
          }
        }
      } else {
        // No session – ensure we are on login screen
        navigation.navigate('Login' as never);
      }
      setSessionChecked(true);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, token, isLoggedIn, isLoading, sessionChecked, logout: performLogout };
}
