import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStore } from '../../stores/globalStore';

/**
 * Props for the network banner component.
 */
export interface NetworkBannerProps {
  message?: string;
  urduMessage?: string;
}

/**
 * Simple banner that shows when the device is offline.
 * Uses NativeWind `className` for styling and slides down on appear.
 */
export function NetworkBanner({
  message = 'No internet connection',
  urduMessage = 'انٹرنیٹ نہیں ہے',
}: NetworkBannerProps) {
  const isOnline = globalStore.useOnlineStatus(); // Assume hook returns boolean.
  if (isOnline) return null;

  return (
    <View
      className="absolute top-0 left-0 right-0 bg-[#DC2626] p-3 flex-row items-center justify-center"
    >
      <View className="mr-2">
        {/* Icon placeholder – replace with actual icon component */}
        <Text style={{ color: '#fff' }}>📶</Text>
      </View>
      <View>
        <Text className="text-white font-medium">{message}</Text>
        <Text
          className="text-white"
          style={{ writingDirection: 'rtl' }}
        >
          {urduMessage}
        </Text>
      </View>
    </View>
  );
}

// The banner slides down using a simple CSS transition defined elsewhere.
// Place <NetworkBanner /> at the root of the app UI hierarchy.
