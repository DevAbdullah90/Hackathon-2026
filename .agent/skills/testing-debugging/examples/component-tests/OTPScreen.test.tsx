import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { OTPScreen } from '../../src/screens/OTPScreen';
import { renderWithProviders } from '../utils/renderWithProviders';
import { mockApiClient, mockApiSuccess, mockApiError, resetApiMocks } from '../mocks/mockApiClient';
import { mockNavigation, resetNavigationMocks } from '../mocks/mockNavigation';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('../../src/api/client', () => ({
  apiClient: mockApiClient,
}));

describe('OTPScreen', () => {
  afterEach(() => {
    resetApiMocks();
    resetNavigationMocks();
  });

  describe('rendering', () => {
    it('renders 6 OTP input boxes', () => {
      const { getAllByTestId } = renderWithProviders(<OTPScreen />);
      expect(getAllByTestId('otp-input')).toHaveLength(6);
    });

    it('renders 60 second countdown timer', () => {
      const { getByText } = renderWithProviders(<OTPScreen />);
      expect(getByText(/60 seconds/i)).toBeTruthy();
    });

    it('renders Verify OTP button', () => {
      const { getByText } = renderWithProviders(<OTPScreen />);
      expect(getByText('Verify OTP')).toBeTruthy();
    });
  });

  describe('OTP input behavior', () => {
    it('auto-focuses next box after digit entry', () => {
      const { getAllByTestId } = renderWithProviders(<OTPScreen />);
      const inputs = getAllByTestId('otp-input');
      fireEvent.changeText(inputs[0], '1');
      expect(inputs[1].props.focused).toBe(true);
    });

    it('goes back to previous box on backspace', () => {
      const { getAllByTestId } = renderWithProviders(<OTPScreen />);
      const inputs = getAllByTestId('otp-input');
      fireEvent.changeText(inputs[1], ''); // simulate backspace on empty second box
      expect(inputs[0].props.focused).toBe(true);
    });

    it('only accepts numeric input', () => {
      const { getAllByTestId } = renderWithProviders(<OTPScreen />);
      const input = getAllByTestId('otp-input')[0];
      fireEvent.changeText(input, 'a');
      expect(input.props.value).toBe('');
    });
  });

  describe('timer', () => {
    it('starts at 60 seconds', () => {
      const { getByText } = renderWithProviders(<OTPScreen />);
      expect(getByText(/60 seconds/i)).toBeTruthy();
    });

    it('shows Resend button after 60 seconds', async () => {
      jest.useFakeTimers();
      const { getByText, queryByText } = renderWithProviders(<OTPScreen />);
      expect(queryByText('Resend')).toBeNull();
      jest.advanceTimersByTime(60000);
      await waitFor(() => {
        expect(getByText('Resend')).toBeTruthy();
      });
      jest.useRealTimers();
    });

    it('resend button disabled before timer ends', () => {
      const { getByText } = renderWithProviders(<OTPScreen />);
      const btn = getByText('Resend');
      expect(btn.props.disabled).toBe(true);
    });
  });

  describe('verification', () => {
    it('shows loading on submit', async () => {
      mockApiSuccess({ token: 'jwt' });
      const { getAllByTestId, getByText, queryByTestId } = renderWithProviders(<OTPScreen />);
      // Fill OTP inputs
      const inputs = getAllByTestId('otp-input');
      inputs.forEach((inp, i) => fireEvent.changeText(inp, String(i + 1)));
      fireEvent.press(getByText('Verify OTP'));
      expect(queryByTestId('loading-spinner')).toBeTruthy();
      await waitFor(() => expect(mockApiClient.post).toHaveBeenCalled());
    });

    it('navigates to Home on correct OTP', async () => {
      mockApiSuccess({ token: 'jwt' });
      const { getAllByTestId, getByText } = renderWithProviders(<OTPScreen />);
      const inputs = getAllByTestId('otp-input');
      inputs.forEach((inp, i) => fireEvent.changeText(inp, String(i + 1)));
      fireEvent.press(getByText('Verify OTP'));
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('shows error on wrong OTP', async () => {
      mockApiError(400, 'Invalid OTP');
      const { getAllByTestId, getByText, findByText } = renderWithProviders(<OTPScreen />);
      const inputs = getAllByTestId('otp-input');
      inputs.forEach((inp, i) => fireEvent.changeText(inp, String(i + 1)));
      fireEvent.press(getByText('Verify OTP'));
      const err = await findByText(/invalid otp/i);
      expect(err).toBeTruthy();
    });

    it('clears inputs on wrong OTP', async () => {
      mockApiError(400, 'Invalid OTP');
      const { getAllByTestId, getByText, findByText } = renderWithProviders(<OTPScreen />);
      const inputs = getAllByTestId('otp-input');
      inputs.forEach((inp, i) => fireEvent.changeText(inp, String(i + 1)));
      fireEvent.press(getByText('Verify OTP'));
      await findByText(/invalid otp/i);
      inputs.forEach(inp => expect(inp.props.value).toBe(''));
    });
  });
});
