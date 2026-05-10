import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    bloodGroup: string;
    city: string;
  };
}

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function sendOTP(phone: string): Promise<SendOTPResponse> {
  try {
    const response = await api.post<SendOTPResponse>('/api/auth/send-otp', { phone } as SendOTPRequest);
    return response.data;
  } catch (error) {
    // Transform error to a consistent shape
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data?.error || 'Failed to send OTP' };
    }
    return { success: false, message: 'Network error' };
  }
}

export async function verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
  try {
    const response = await api.post<VerifyOTPResponse>('/api/auth/verify-otp', { phone, otp } as VerifyOTPRequest);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, token: '', user: { id: '', name: '', bloodGroup: '', city: '' } };
    }
    return { success: false, token: '', user: { id: '', name: '', bloodGroup: '', city: '' } };
  }
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('authToken', token);
}

export async function getToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync('authToken');
  return token;
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync('authToken');
}
