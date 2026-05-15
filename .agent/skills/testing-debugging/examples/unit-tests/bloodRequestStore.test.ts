import { bloodRequestStore, resetBloodRequestStore } from '../../src/stores/bloodRequestStore';
import { createMockBloodRequest } from '../utils/testHelpers';

describe('bloodRequestStore', () => {
  beforeEach(() => {
    resetBloodRequestStore();
  });

  describe('setActiveRequest', () => {
    it('sets active request correctly', () => {
      const request = createMockBloodRequest();
      bloodRequestStore.setActiveRequest(request);
      expect(bloodRequestStore.state.activeRequest).toEqual(request);
    });

    it('sets urgency level from request data', () => {
      const request = createMockBloodRequest({ urgency: 'critical' });
      bloodRequestStore.setActiveRequest(request);
      expect(bloodRequestStore.state.activeRequest?.urgency).toBe('critical');
    });
  });

  describe('setRequestStatus', () => {
    it('updates status to matched', () => {
      const request = createMockBloodRequest();
      bloodRequestStore.setActiveRequest(request);
      bloodRequestStore.setRequestStatus('matched');
      expect(bloodRequestStore.state.activeRequest?.status).toBe('matched');
    });

    it('updates status to fulfilled', () => {
      const request = createMockBloodRequest();
      bloodRequestStore.setActiveRequest(request);
      bloodRequestStore.setRequestStatus('fulfilled');
      expect(bloodRequestStore.state.activeRequest?.status).toBe('fulfilled');
    });

    it('status flow: pending → matched → fulfilled', () => {
      const request = createMockBloodRequest({ status: 'pending' });
      bloodRequestStore.setActiveRequest(request);
      bloodRequestStore.setRequestStatus('matched');
      expect(bloodRequestStore.state.activeRequest?.status).toBe('matched');
      bloodRequestStore.setRequestStatus('fulfilled');
      expect(bloodRequestStore.state.activeRequest?.status).toBe('fulfilled');
    });
  });

  describe('setMatchedDonors', () => {
    it('sets matched donors list', () => {
      const donors = [createMockBloodRequest()]; // reuse shape for simplicity
      bloodRequestStore.setMatchedDonors(donors as any);
      expect(bloodRequestStore.state.matchedDonors).toEqual(donors);
    });

    it('replaces existing matched donors', () => {
      bloodRequestStore.setMatchedDonors([createMockBloodRequest() as any]);
      const newDonors = [createMockBloodRequest() as any];
      bloodRequestStore.setMatchedDonors(newDonors);
      expect(bloodRequestStore.state.matchedDonors).toEqual(newDonors);
    });
  });

  describe('clearActiveRequest', () => {
    it('clears all request state', () => {
      const request = createMockBloodRequest();
      bloodRequestStore.setActiveRequest(request);
      bloodRequestStore.clearActiveRequest();
      expect(bloodRequestStore.state.activeRequest).toBeNull();
    });

    it('moves active to history before clearing', () => {
      const request = createMockBloodRequest();
      bloodRequestStore.setActiveRequest(request);
      bloodRequestStore.clearActiveRequest();
      expect(bloodRequestStore.state.requestHistory).toContainEqual(request);
    });
  });
});
