import * as SecureStore from 'expo-secure-store';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Interfaces defining stored session data and JWT payload
export interface StoredSession {
  token: string;
  user: {
    id: string;
    name: string;
    bloodGroup: string;
    city: string;
  };
}

export interface JWTPayload {
  sub: string;
  exp: number;
  role: string;
  bloodGroup: string;
}

export interface RefreshResponse {
  success: boolean;
  token: string;
}

// SecureStore keys – separate for token and user for easier clearing and potential future granularity
const TOKEN_KEY = 'bl_token';
const USER_KEY = 'bl_user';

/**
 * Save session data securely.
 * Token and user are stored under distinct keys to allow independent clearing if needed.
 */
export async function saveSession(token: string, user: StoredSession['user']): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/** Retrieve stored session or null if any component missing */
export async function getSession(): Promise<StoredSession | null> {
  const [token, userJson] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);
  if (!token || !userJson) {
    return null;
  }
  try {
    const user = JSON.parse(userJson) as StoredSession['user'];
    return { token, user };
  } catch {
    // Corrupted user data – treat as no session
    return null;
  }
}

/** Clear all session data – called on logout or unrecoverable auth failure */
export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

/** Decode JWT payload without external libraries – base64url decode */
export function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1];
    // Pad base64 string if necessary
    const padded = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(padded);
    const payload: JWTPayload = JSON.parse(decoded);
    const now = Math.floor(Date.now() / 1000);
    // Treat missing exp as expired
    return !payload.exp || now >= payload.exp;
  } catch {
    // Any error in decode/parsing means we consider it expired
    return true;
  }
}

/** Refresh JWT using current token; throws on failure */
export async function refreshToken(currentToken: string): Promise<string> {
  try {
    const response = await axios.post<RefreshResponse>('/api/auth/refresh', null, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    if (response.data.success) {
      return response.data.token;
    }
    throw new Error('Refresh failed');
  } catch (err) {
    throw new Error('AuthError: Unable to refresh token');
  }
}

/** Axios instance with automatic token handling */
export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.bloodlink.org', // Adjust to actual backend URL
});

// Request interceptor – attaches token from SecureStore to each request
apiClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handles 401 by attempting a refresh, then retries original request
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const currentToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (currentToken) {
        try {
          const newToken = await refreshToken(currentToken);
          await SecureStore.setItemAsync(TOKEN_KEY, newToken);
          // Update header and retry
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch {
          await clearSession();
          throw new Error('AuthError: Session expired, please login again');
        }
      }
    }
    // Propagate other errors or unrecoverable 401
    if (error.response?.status === 500) {
      throw new Error('NetworkError: Server error');
    }
    return Promise.reject(error);
  }
);
