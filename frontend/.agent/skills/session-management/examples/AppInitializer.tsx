import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSession } from './useSession';
import type { ReactNode } from 'react';

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * Wraps the application, runs session initialization on mount.
 * Renders a full‑screen loader while sessionChecked is false to avoid flash of the splash/login screens.
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { sessionChecked, isLoading } = useSession();

  if (!sessionChecked || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-4 text-xl font-semibold text-[#DC2626]">BloodLink</Text>
      </View>
    );
  }

  return <>{children}</>;
};

/**
 * Usage example (in comments):
 * <AppInitializer>
 *   <NavigationContainer>
 *     <AppNavigator />
 *   </NavigationContainer>
 * </AppInitializer>
 */
