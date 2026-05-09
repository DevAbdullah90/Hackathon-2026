import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useStore } from 'zustand'; // assuming zustand store usage
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { RootStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator decides whether to show the authentication flow or the main app
 * based on the user's session state. This provides a single source of truth for
 * auth routing, keeping the logic in one place.
 */
export const RootNavigator = () => {
  // Replace with actual session store implementation
  const isLoggedIn = useStore(state => state.session?.isLoggedIn ?? false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        {isLoggedIn ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
