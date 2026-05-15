import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { renderWithProviders } from '../utils/renderWithProviders';
import { mockApiClient, mockApiSuccess, mockApiError, resetApiMocks } from '../mocks/mockApiClient';
import { mockNavigation, resetNavigationMocks } from '../mocks/mockNavigation';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('../../src/api/client', () => ({
  apiClient: mockApiClient,
}));

describe('LoginScreen', () => {
  afterEach(() => {
    resetApiMocks();
    resetNavigationMocks();
  });

  describe('rendering', () => {
    it('renders phone input', () => {
      const { getByPlaceholderText } = renderWithProviders(<LoginScreen />);
      expect(getByPlaceholderText('Phone Number')).toBeTruthy();
    });

    it('renders Send OTP button', () => {
      const { getByText } = renderWithProviders(<LoginScreen />);
      expect(getByText('Send OTP')).toBeTruthy();
    });

    it('renders BloodLink title', () => {
      const { getByText } = renderWithProviders(<LoginScreen />);
      expect(getByText('BloodLink')).toBeTruthy();
    });
  });

  describe('phone input', () => {
    it('accepts Pakistan phone number', () => {
      const { getByPlaceholderText } = renderWithProviders(<LoginScreen />);
      const input = getByPlaceholderText('Phone Number');
      fireEvent.changeText(input, '+923001234567');
      expect(input.props.value).toBe('+923001234567');
    });

    it('shows error for invalid number under 10 digits', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen />);
      const input = getByPlaceholderText('Phone Number');
      fireEvent.changeText(input, '12345');
      fireEvent.press(getByText('Send OTP'));
      await waitFor(() => {
        expect(getByText(/invalid phone/i)).toBeTruthy();
      });
    });

    it('shows error for number over 10 digits', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen />);
      const input = getByPlaceholderText('Phone Number');
      fireEvent.changeText(input, '0123456789012');
      fireEvent.press(getByText('Send OTP'));
      await waitFor(() => {
        expect(getByText(/invalid phone/i)).toBeTruthy();
      });
    });

    it('formats +92 prefix automatically', () => {
      const { getByPlaceholderText } = renderWithProviders(<LoginScreen />);
      const input = getByPlaceholderText('Phone Number');
      fireEvent.changeText(input, '3001234567');
      // Assuming component adds +92 automatically
      expect(input.props.value).toBe('+923001234567');
    });
  });

  describe('OTP submission', () => {
    it('shows loading spinner while sending OTP', async () => {
      mockApiSuccess({ success: true });
      const { getByPlaceholderText, getByText, queryByTestId } = renderWithProviders(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '+923001234567');
      fireEvent.press(getByText('Send OTP'));
      expect(queryByTestId('loading-spinner')).toBeTruthy();
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      });
    });

    it('navigates to OTP screen on success', async () => {
      mockApiSuccess({ success: true });
      const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '+923001234567');
      fireEvent.press(getByText('Send OTP'));
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('OTPScreen', { phone: '+923001234567' });
      });
    });

    it('shows error message on API failure', async () => {
      mockApiError(500, 'Server error');
      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '+923001234567');
      fireEvent.press(getByText('Send OTP'));
      const errorMsg = await findByText(/server error/i);
      expect(errorMsg).toBeTruthy();
    });

    it('disables button while loading', async () => {
      mockApiSuccess({ success: true });
      const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '+923001234567');
      fireEvent.press(getByText('Send OTP'));
      expect(getByText('Send OTP').props.accessible).toBe(false);
    });
  });
});
