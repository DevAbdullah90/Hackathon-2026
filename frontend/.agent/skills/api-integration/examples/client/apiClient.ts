import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

// Custom error classes (simplified placeholders)
class NetworkError extends Error {
  static offline() { return new NetworkError('No network connection'); }
  static timeout() { return new NetworkError('Request timed out'); }
}
class AuthError extends Error {
  static tokenExpired() { return new AuthError('Token expired'); }
}
class ApiError extends Error {
  static notFound(url: string) { return new ApiError(`Not found: ${url}`); }
  static validationFailed(details: Record<string, string[]>) {
    return new ApiError('Validation failed');
  }
  static serverError(status: number) { return new ApiError(`Server error ${status}`); }
}

const extractValidationErrors = (data: unknown): Record<string, string[]> => {
  if (typeof data === 'object' && data && 'detail' in data) {
    // FastAPI 422 error format assumed
    const details = (data as any).detail;
    const errors: Record<string, string[]> = {};
    if (Array.isArray(details)) {
      details.forEach((item: any) => {
        if (item.loc && item.msg) {
          const field = item.loc.slice(-1)[0];
          if (!errors[field]) errors[field] = [];
          errors[field].push(item.msg);
        }
      });
    }
    return errors;
  }
  return {};
};

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL as string,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    console.log('Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('API error', error);
    }
    if (!error.response) {
      // No response received – network error
      throw NetworkError.offline();
    }
    const { status, config, data } = error.response;
    switch (status) {
      case 401:
        throw AuthError.tokenExpired();
      case 404:
        throw ApiError.notFound(config?.url ?? '');
      case 422:
        throw ApiError.validationFailed(extractValidationErrors(data));
      case 500:
        throw ApiError.serverError(500);
      case 408:
        throw NetworkError.timeout();
      default:
        throw new Error('Unexpected API error');
    }
  }
);

export default apiClient;