import { create } from 'zustand';
import { GlobalStoreState } from '../../types/store.types';

export const useGlobalStore = create<GlobalStoreState>((set, get) => ({
  language: 'en',
  isOnline: true,
  appVersion: '1.0.0',
  isEmergencyMode: false,

  setLanguage: (lang) => set({ language: lang }),
  setOnline: (status) => set({ isOnline: status }),
  toggleEmergencyMode: () => set(state => ({ isEmergencyMode: !state.isEmergencyMode }))
}));

// Emergency mode switches UI to a red theme (#DC2626) for critical requests.
// Language 'ur' enables Urdu RTL support for Pakistani users.
