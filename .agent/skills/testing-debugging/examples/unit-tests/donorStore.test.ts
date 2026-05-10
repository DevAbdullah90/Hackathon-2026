import { donorStore, resetDonorStore } from '../../src/stores/donorStore';
import { createMockDonor } from '../utils/testHelpers';

describe('donorStore', () => {
  beforeEach(() => {
    resetDonorStore();
  });

  describe('setDonors', () => {
    it('sets donor list correctly', () => {
      const donors = [createMockDonor()];
      donorStore.setDonors(donors);
      expect(donorStore.state.donors).toEqual(donors);
    });

    it('updates availableDonors after setDonors', () => {
      const donors = [createMockDonor({ isAvailable: true })];
      donorStore.setDonors(donors);
      expect(donorStore.state.availableDonors).toContainEqual(donors[0]);
    });

    it('sets lastFetched timestamp', () => {
      const before = Date.now();
      donorStore.setDonors([]);
      const after = Date.now();
      expect(donorStore.state.lastFetched).toBeGreaterThanOrEqual(before);
      expect(donorStore.state.lastFetched).toBeLessThanOrEqual(after);
    });
  });

  describe('setSelectedDonor', () => {
    it('sets selected donor', () => {
      const donor = createMockDonor();
      donorStore.setSelectedDonor(donor.id);
      expect(donorStore.state.selectedDonorId).toBe(donor.id);
    });

    it('clears selected donor when null passed', () => {
      donorStore.setSelectedDonor(null as any);
      expect(donorStore.state.selectedDonorId).toBeNull();
    });
  });

  describe('updateDonorStatus', () => {
    it('updates specific donor availability', () => {
      const donor = createMockDonor({ isAvailable: true });
      donorStore.setDonors([donor]);
      donorStore.updateDonorStatus(donor.id, false);
      expect(donorStore.state.donors[0].isAvailable).toBe(false);
    });

    it('does nothing if donor id not found', () => {
      donorStore.updateDonorStatus('nonexistent', true);
      // No error thrown, state unchanged
      expect(donorStore.state.donors).toHaveLength(0);
    });

    it('updates availableDonors list after status change', () => {
      const donor = createMockDonor({ isAvailable: false });
      donorStore.setDonors([donor]);
      donorStore.updateDonorStatus(donor.id, true);
      expect(donorStore.state.availableDonors).toContainEqual(expect.objectContaining({ id: donor.id }));
    });
  });

  describe('clearDonors', () => {
    it('resets all donor state', () => {
      donorStore.setDonors([createMockDonor()]);
      donorStore.clearDonors();
      expect(donorStore.state.donors).toEqual([]);
      expect(donorStore.state.availableDonors).toEqual([]);
    });

    it('called on logout clears everything', () => {
      donorStore.setDonors([createMockDonor()]);
      donorStore.clearDonors(); // simulate logout
      expect(donorStore.state.selectedDonorId).toBeNull();
    });
  });
});
