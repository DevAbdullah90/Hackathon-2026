import { jest } from '@jest/globals';
import axios from 'axios';

// Mock axios instance
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

// Helper to set successful response
export function mockApiSuccess(data: unknown): void {
  mockApiClient.get.mockResolvedValue({ data });
  mockApiClient.post.mockResolvedValue({ data });
  mockApiClient.patch.mockResolvedValue({ data });
  mockApiClient.delete.mockResolvedValue({ data });
}

// Helper to set error response with status and message
export function mockApiError(status: number, message: string): void {
  const error = {
    response: { status, data: { message } },
    isAxiosError: true,
  } as any;
  mockApiClient.get.mockRejectedValue(error);
  mockApiClient.post.mockRejectedValue(error);
  mockApiClient.patch.mockRejectedValue(error);
  mockApiClient.delete.mockRejectedValue(error);
}

// Helper to simulate network error (no response)
export function mockNetworkError(): void {
  const error = { request: {}, isAxiosError: true } as any;
  mockApiClient.get.mockRejectedValue(error);
  mockApiClient.post.mockRejectedValue(error);
  mockApiClient.patch.mockRejectedValue(error);
  mockApiClient.delete.mockRejectedValue(error);
}

// Reset all mock implementations
export function resetApiMocks(): void {
  mockApiClient.get.mockReset();
  mockApiClient.post.mockReset();
  mockApiClient.patch.mockReset();
  mockApiClient.delete.mockReset();
}

// Example usage in a test:
// mockApiSuccess({ donors: [] });
// const result = await donorApi.getNearby('A+', 'Karachi', 5);
// expect(result.donors).toHaveLength(0);