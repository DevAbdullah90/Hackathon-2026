import { create } from 'zustand';
import { Donor, DonorLocation } from '../../types/donor.types';
import { DonorStoreState } from '../../types/store.types';

export const useDonorStore = create<DonorStoreState>((set, get) => ({
  donors: [],
  selectedDonor: null,
  availableDonors: [],
  isLoading: false,
  lastFetched: null,

  setDonors: (donors) => {
    set({ donors, lastFetched: Date.now() });
    // After setting donors, automatically filter available donors.
    get().filterAvailable();
  },

  setSelectedDonor: (donor) => set({ selectedDonor: donor }),

  filterAvailable: () => {
    const { donors } = get();
    const available = donors.filter(d => d.isAvailable);
    set({ availableDonors: available });
  },

  updateDonorStatus: (donorId, isAvailable) => {
    set(state => {
      const updatedDonors = state.donors.map(d =>
        d.id === donorId ? { ...d, isAvailable, availability: isAvailable ? 'available' : 'unavailable' } : d
      );
      return { donors: updatedDonors };
    });
    // Re‑run filter after status change.
    get().filterAvailable();
  },

  clearDonors: () => set({ donors: [], selectedDonor: null, availableDonors: [], isLoading: false, lastFetched: null })
}));

// lastFetched is a timestamp (ms) to allow cache‑busting logic.
// filterAvailable runs after setDonors to keep UI consistent.
// Donor locations across Karachi, Lahore, Islamabad, etc. are handled in DonorLocation.
