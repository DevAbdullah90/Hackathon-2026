import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { renderWithProviders } from '../utils/renderWithProviders';
import { globalErrorHandler } from '../../src/utils/globalErrorHandler';

// Helper component that throws when rendered
const ThrowError = () => {
  throw new Error('Test error');
};

jest.mock('../../src/utils/globalErrorHandler', () => ({
  logError: jest.fn(),
}));

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <React.Fragment>
          <Text>Normal content</Text>
        </React.Fragment>
      </ErrorBoundary>
    );
    expect(getByText('Normal content')).toBeTruthy();
  });

  it('catches render error and shows ErrorScreen', () => {
    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(getByText(/something went wrong/i)).toBeTruthy();
  });

  it('shows custom fallback when provided', () => {
    const Fallback = () => <Text>Custom fallback</Text>;
    const { getByText } = renderWithProviders(
      <ErrorBoundary fallback={<Fallback />}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(getByText('Custom fallback')).toBeTruthy();
  });

  it('logs error to globalErrorHandler', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(globalErrorHandler.logError).toHaveBeenCalled();
  });

  it('shows retry button when onRetry provided', async () => {
    const onRetry = jest.fn();
    const { getByText } = renderWithProviders(
      <ErrorBoundary onRetry={onRetry}>
        <ThrowError />
      </ErrorBoundary>
    );
    fireEvent.press(getByText('Retry'));
    await waitFor(() => expect(onRetry).toHaveBeenCalled());
  });

  it('re-renders children after retry', async () => {
    const onRetry = jest.fn(() => null);
    const { getByText, queryByText, rerender } = render(
      <ErrorBoundary onRetry={onRetry}>
        <ThrowError />
      </ErrorBoundary>
    );
    fireEvent.press(getByText('Retry'));
    // Simulate retry succeeding by rendering normal child
    rerender(
      <ErrorBoundary onRetry={onRetry}>
        <Text>Recovered content</Text>
      </ErrorBoundary>
    );
    await waitFor(() => expect(queryByText('Recovered content')).toBeTruthy());
  });
});
