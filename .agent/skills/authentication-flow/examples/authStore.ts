import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  bloodGroup: string;
  city: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,
  setAuth: (user, token) => set({ user, token, isLoggedIn: true, isLoading: false }),
  clearAuth: () => set({ user: null, token: null, isLoggedIn: false, isLoading: false }),
  setLoading: loading => set({ isLoading: loading }),
}));
