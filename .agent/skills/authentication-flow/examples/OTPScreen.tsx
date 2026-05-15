import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from './AuthNavigator';
import { verifyOTP } from './authService';
import { saveToken } from './authService';

type OTPScreenParams = {
  phone: string;
};

type OTPScreenRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

type OTPScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<OTPScreenRouteProp>();
  const { phone } = route.params;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const inputRefs = useRef<Array<React.RefObject<TextInput>>>([]);

  useEffect(() => {
    // Initialize refs for 6 inputs
    inputRefs.current = Array.from({ length: 6 }, () => React.createRef<TextInput>());
    // Start countdown
    timerRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleChange = (text: string, index: number) => {
    if (/\D/.test(text)) return; // ignore non-digits
    const newOtp = otp.split('');
    newOtp[index] = text;
    setOtp(newOtp.join(''));
    if (text && index < 5) {
      inputRefs.current[index + 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await verifyOTP(phone, otp);
      if (response.success) {
        await saveToken(response.token);
        navigation.reset({ index: 0, routes: [{ name: 'Home' as any }] }); // Assuming Home exists
      } else {
        setError('Invalid OTP');
        setOtp('');
        inputRefs.current[0].current?.focus();
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    // Placeholder: implement sendOTP resend logic
    setCounter(60);
    // Restart timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <View className="flex-1 bg-white p-4 justify-center">
      <Text className="text-center mb-4" style={{ color: '#DC2626' }}>Enter OTP sent to {phone}</Text>
      <View className="flex-row justify-center space-x-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <TextInput
            key={i}
            ref={inputRefs.current[i]}
            style={{ borderBottomWidth: 1, borderColor: '#DC2626', width: 40, textAlign: 'center' }}
            keyboardType="number-pad"
            maxLength={1}
            value={otp[i] ?? ''}
            onChangeText={text => handleChange(text, i)}
          />
        ))}
      </View>
      {error ? (
        <Text className="text-red-600 text-center mb-2">{error}</Text>
      ) : null}
      <TouchableOpacity
        className="bg-[#DC2626] rounded p-3"
        disabled={loading}
        onPress={handleVerify}
      >
        <Text className="text-white text-center">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>
      {counter === 0 ? (
        <TouchableOpacity onPress={resendOTP} className="mt-4">
          <Text className="text-[#DC2626] text-center">Resend OTP</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-center mt-4">{counter}s remaining</Text>
      )}
    </View>
  );
};

export default OTPScreen;
