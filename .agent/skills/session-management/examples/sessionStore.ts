import create from 'zustand';
import { devtools } from 'zustand/middleware';

// User data stored in session
export interface User {
  id: string;
  name: string;
  bloodGroup: string;
  city: string;
}

export interface SessionState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setSessionChecked: (checked: boolean) => void;
}

/**
 * Zustand store for session handling.
 * sessionChecked prevents flicker between splash and login screens – it is set to true only after
 * the async SecureStore check completes in AppInitializer.
 */
export const useSessionStore = create<SessionState>()(
  devtools((set) => ({
    user: null,
    token: null,
    isLoggedIn: false,
    isLoading: false,
    sessionChecked: false,
    setSession: (user, token) =>
      set({ user, token, isLoggedIn: true, isLoading: false }),
    clearSession: () =>
      set({ user: null, token: null, isLoggedIn: false, isLoading: false }),
    setLoading: (loading) => set({ isLoading: loading }),
    setSessionChecked: (checked) => set({ sessionChecked: checked }),
  }))
);
