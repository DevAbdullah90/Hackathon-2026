# Testing Patterns for BloodLink

## 1. Arrange‑Act‑Assert (AAA)
```ts
// Arrange
mockApiSuccess({ token: 'jwt' });
const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen />);
// Act
fireEvent.changeText(getByPlaceholderText('Phone Number'), '+923001234567');
fireEvent.press(getByText('Send OTP'));
// Assert
await waitFor(() => expect(mockApiClient.post).toHaveBeenCalled());
```
The pattern keeps tests readable and separates setup from verification.

## 2. Store Testing Pattern (Zustand)
```ts
import { donorStore, resetDonorStore } from '../../src/stores/donorStore';

beforeEach(() => resetDonorStore());

it('adds donors and updates availability', () => {
  const donor = createMockDonor();
  donorStore.setDonors([donor]);
  expect(donorStore.state.donors).toContainEqual(donor);
  expect(donorStore.state.availableDonors).toContainEqual(donor);
});
```
Reset the store in `beforeEach` to avoid state leakage.

## 3. API Mock Pattern
```ts
import { mockApiSuccess, mockApiError } from '../utils/mockApiClient';

it('handles happy path', async () => {
  mockApiSuccess({ data: [] });
  await expect(service.fetchData()).resolves.toEqual([]);
});

it('handles 400 error', async () => {
  mockApiError(400, 'Bad Request');
  await expect(service.fetchData()).rejects.toThrow('ApiError');
});
```
Use helpers `mockApiSuccess` / `mockApiError` for consistency.

## 4. Component Interaction Pattern (RNTL)
```ts
const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen />);
fireEvent.changeText(getByPlaceholderText('Phone Number'), '+923001234567');
fireEvent.press(getByText('Send OTP'));
await waitFor(() => expect(mockNavigation.navigate).toHaveBeenCalledWith('OTPScreen'));
```
Focus on user actions (`fireEvent`) and then verify side‑effects.

## 5. Async Testing Pattern
```ts
await waitFor(() => expect(someAsyncFn).toHaveBeenCalled());
await waitFor(() => expect(screen.getByText('Success')).toBeTruthy());
```
Use `waitFor` for any state change that occurs after a promise resolves.

## 6. Timer / Countdown Pattern
```ts
jest.useFakeTimers();
const { getByText } = renderWithProviders(<OTPScreen />);
jest.advanceTimersByTime(60000);
expect(getByText('Resend')).toBeTruthy();
jest.useRealTimers();
```
Fake timers keep tests fast and deterministic.

## 7. Error Boundary Pattern
```ts
render(
  <ErrorBoundary fallback={<Text>Oops</Text>}>
    <ThrowError />
  </ErrorBoundary>
);
expect(screen.getByText('Oops')).toBeTruthy();
```
Assert that the fallback UI appears and that `globalErrorHandler` is called.

---
*Follow these patterns to keep tests maintainable and reliable across the BloodLink codebase.*