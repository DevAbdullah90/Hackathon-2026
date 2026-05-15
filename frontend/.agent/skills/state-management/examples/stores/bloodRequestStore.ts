import { create } from 'zustand';
import { BloodRequest, Donor, RequestStatus, UrgencyLevel, BloodGroup } from '../../types/request.types';
import { BloodRequestStoreState } from '../../types/store.types';

export const useBloodRequestStore = create<BloodRequestStoreState>((set) => ({
  activeRequest: null,
  requestHistory: [],
  requestStatus: null,
  urgencyLevel: null,
  matchedDonors: [],
  isSubmitting: false,

  setActiveRequest: (request) => {
    set({
      activeRequest: request,
      requestStatus: request.status,
      urgencyLevel: request.urgency,
      matchedDonors: request.matchedDonors ?? []
    });
  },

  setRequestStatus: (status) => set({ requestStatus: status }),
  setUrgencyLevel: (level) => set({ urgencyLevel: level }),
  setMatchedDonors: (donors) => set({ matchedDonors: donors }),

  addToHistory: (request) => set(state => ({
    requestHistory: [request, ...state.requestHistory]
  })),

  clearActiveRequest: () => set({
    activeRequest: null,
    requestStatus: null,
    urgencyLevel: null,
    matchedDonors: []
  })
}));

// Urgency levels drive UI urgency indicators:
// critical → emergency UI, urgent → high priority, normal → standard flow.
