import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSessionStore } from './sessionStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Guards private screens. If user is not logged in, redirects to Login.
 * Placed around screens that require authentication.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigation = useNavigation();
  const { isLoggedIn } = useSessionStore();

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.navigate('Login' as never);
    }
  }, [isLoggedIn, navigation]);

  if (!isLoggedIn) {
    // While redirecting, render nothing
    return null;
  }

  return <>{children}</>;
};

/**
 * Usage example (in comments):
 * <ProtectedRoute>
 *   <HomeScreen />
 * </ProtectedRoute>
 */
