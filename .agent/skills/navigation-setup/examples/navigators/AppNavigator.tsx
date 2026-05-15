import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation.types';
import TabNavigator from './TabNavigator';
import DonorProfileScreen from '../../screens/DonorProfileScreen';
import RequestStatusScreen from '../../screens/RequestStatusScreen';
import EmergencyScreen from '../../screens/EmergencyScreen';
import NotificationsScreen from '../../screens/NotificationsScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * AppNavigator hosts the main application flow after authentication.
 * It includes the tab navigator and several modal screens.
 */
export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Tabs container */}
    <Stack.Screen name="Tabs" component={TabNavigator} />
    {/* Modal screens */}
    <Stack.Screen
      name="DonorProfile"
      component={DonorProfileScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen
      name="RequestStatus"
      component={RequestStatusScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen
      name="Emergency"
      component={EmergencyScreen}
      options={{
        presentation: 'modal',
        contentStyle: { backgroundColor: '#DC2626' },
      }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      // Default slide from right animation
    />
  </Stack.Navigator>
);
