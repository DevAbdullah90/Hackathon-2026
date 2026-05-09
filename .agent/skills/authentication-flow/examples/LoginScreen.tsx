import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from './AuthNavigator';
import { sendOTP } from './authService';

const formatPhone = (input: string): string => {
  // Remove non-digit characters
  const digits = input.replace(/\D/g, '');
  // Ensure starts with +92 and max 12 digits (+92 + 10 digits)
  const formatted = '+92' + digits.slice(-10);
  return formatted;
};

const validatePhone = (phone: string): boolean => {
  const regex = /^\+92\d{10}$/;
  return regex.test(phone);
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const formatted = formatPhone(phone);
    if (!validatePhone(formatted)) {
      setError('Invalid phone number. Use format +92XXXXXXXXXX');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await sendOTP(formatted);
      if (response.success) {
        navigation.navigate('OTP', { phone: formatted });
      } else {
        setError(response.message);
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4 justify-center">
      <Text className="text-2xl font-bold mb-4 text-center" style={{ color: '#DC2626' }}>Login</Text>
      <TextInput
        className="border rounded px-3 py-2 mb-2"
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      {error ? (
        <Text className="text-red-600 mb-2">{error}</Text>
      ) : null}
      <TouchableOpacity
        className="bg-[#DC2626] rounded p-3"
        disabled={loading}
        onPress={handleSendOTP}
      >
        <Text className="text-white text-center">{loading ? 'Sending...' : 'Send OTP'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
