import { jest } from '@jest/globals';

// In-memory store for SecureStore
const store = new Map<string, string>();

export const mockSecureStore = {
  setItemAsync: jest.fn(async (key: string, value: string) => {
    store.set(key, value);
  }),
  getItemAsync: jest.fn(async (key: string) => {
    return store.has(key) ? store.get(key)! : null;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    store.delete(key);
  }),
};

export function resetSecureStore(): void {
  store.clear();
  mockSecureStore.setItemAsync.mockReset();
  mockSecureStore.getItemAsync.mockReset();
  mockSecureStore.deleteItemAsync.mockReset();
}

// jest.mock('expo-secure-store') would be placed in the test setup file.
// The above provides a simple in-memory mock suitable for unit tests.
