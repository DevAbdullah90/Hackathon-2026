import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation.types';
import SplashScreen from '../../screens/SplashScreen';
import LoginScreen from '../../screens/LoginScreen';
import OTPScreen from '../../screens/OTPScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator contains the screens for the authentication flow.
 * No header is shown and the OTP screen disables the back gesture so the
 * user cannot navigate back after submitting the code.
 */
export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen
      name="OTP"
      component={OTPScreen}
      options={{
        // Disables back navigation on OTP screen
        gestureEnabled: false,
        // Optionally hide header if not already hidden
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);
