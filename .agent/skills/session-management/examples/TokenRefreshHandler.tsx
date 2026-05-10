import React, { useEffect } from 'react';
import { apiClient } from './sessionService';
import { useSessionStore } from './sessionStore';
import SecureStore from 'expo-secure-store';
import { refreshToken, clearSession } from './sessionService';
import { useNavigation } from '@react-navigation/native';

/**
 * Invisible component that attaches a global axios response interceptor for token refresh.
 * Placed at the root of the app so it catches all API calls.
 */
export const TokenRefreshHandler: React.FC = () => {
  const { setSession, clearSession: clearStore } = useSessionStore();
  const navigation = useNavigation();

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const currentToken = await SecureStore.getItemAsync('bl_token');
          if (currentToken) {
            try {
              const newToken = await refreshToken(currentToken);
              await SecureStore.setItemAsync('bl_token', newToken);
              // Update store with new token (user data unchanged)
              const currentUser = useSessionStore.getState().user;
            if (currentUser) {
                setSession(currentUser, newToken);
            }
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            } catch {
              await clearSession();
              clearStore();
              navigation.navigate('Login' as never);
            }
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Component renders nothing
  return null;
};
