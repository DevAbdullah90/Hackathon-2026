import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation.types';
import HomeScreen from '../../screens/HomeScreen';
import MapScreen from '../../screens/MapScreen';
import RequestScreen from '../../screens/RequestScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useStore } from 'zustand'; // replace with actual store hooks

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * TabNavigator defines the bottom tab bar with four primary tabs.
 * Uses NativeWind for styling and shows dynamic badges.
 */
export const TabNavigator = () => {
  // Example stores for badge counts (replace with real stores)
  const pendingRequest = useStore(state => state.bloodRequest?.hasPending ?? false);
  const unreadCount = useStore(state => state.notification?.unreadCount ?? 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb', // light gray
          borderTopWidth: 1,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Request') {
            iconName = focused ? 'water' : 'water-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarBadge: (() => {
          if (route.name === 'Request' && pendingRequest) {
            return '•'; // red dot; NativeWind will color via tabBarActiveTintColor
          }
          if (route.name === 'Profile' && unreadCount > 0) {
            return unreadCount;
          }
          return undefined;
        })(),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Request" component={RequestScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
