import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from './AuthNavigator';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Splash'>>();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          navigation.replace('Home'); // Assuming Home is defined elsewhere
        } else {
          navigation.replace('Login');
        }
      } catch (e) {
        navigation.replace('Login');
      } finally {
        setChecking(false);
      }
    };
    checkToken();
  }, [navigation]);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return null;
};

export default SplashScreen;
