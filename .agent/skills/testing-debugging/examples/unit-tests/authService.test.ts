import { authService } from '../../src/services/authService';
import { mockApiClient, mockApiSuccess, mockApiError, mockNetworkError, resetApiMocks } from '../mocks/mockApiClient';
import { mockSecureStore, resetSecureStore } from '../mocks/mockSecureStore';

jest.mock('expo-secure-store', () => mockSecureStore);
jest.mock('../../src/api/client', () => ({
  apiClient: mockApiClient,
}));

describe('authService', () => {
  afterEach(() => {
    resetApiMocks();
    resetSecureStore();
  });

  describe('sendOTP', () => {
    it('sends OTP to valid Pakistan number', async () => {
      mockApiSuccess({ success: true });
      await expect(authService.sendOTP('+923001234567')).resolves.toEqual({ success: true });
      expect(mockApiClient.post).toHaveBeenCalledWith('/otp/send', { phone: '+923001234567' });
    });

    it('throws NetworkError when offline', async () => {
      mockNetworkError();
      await expect(authService.sendOTP('+923001234567')).rejects.toThrow('NetworkError');
    });

    it('throws ApiError on invalid phone format', async () => {
      mockApiError(400, 'Invalid phone');
      await expect(authService.sendOTP('123')).rejects.toThrow('ApiError');
    });

    it('formats +92 prefix correctly before sending', async () => {
      mockApiSuccess({ success: true });
      await authService.sendOTP('3001234567'); // missing +92
      expect(mockApiClient.post).toHaveBeenCalledWith('/otp/send', { phone: '+923001234567' });
    });
  });

  describe('verifyOTP', () => {
    it('returns token and user on correct OTP', async () => {
      const mockResponse = { token: 'jwt', user: { id: 'user_1', name: 'Ali' } };
      mockApiSuccess(mockResponse);
      await expect(authService.verifyOTP('+923001234567', '123456')).resolves.toEqual(mockResponse);
    });

    it('throws ApiError on wrong OTP', async () => {
      mockApiError(401, 'Wrong OTP');
      await expect(authService.verifyOTP('+923001234567', '000000')).rejects.toThrow('ApiError');
    });

    it('throws ApiError on expired OTP', async () => {
      mockApiError(410, 'OTP expired');
      await expect(authService.verifyOTP('+923001234567', '123456')).rejects.toThrow('ApiError');
    });
  });

  describe('saveToken / getToken / deleteToken', () => {
    const token = 'jwt-token';
    it('saves token to SecureStore', async () => {
      await authService.saveToken(token);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('authToken', token);
    });

    it('retrieves saved token correctly', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(token);
      await expect(authService.getToken()).resolves.toBe(token);
    });

    it('returns null when no token exists', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
      await expect(authService.getToken()).resolves.toBeNull();
    });

    it('deletes token on logout', async () => {
      await authService.deleteToken();
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('authToken');
    });
  });
});
