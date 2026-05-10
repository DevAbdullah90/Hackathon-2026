# Common Testing Errors and Fixes for BloodLink

1. **Cannot find module `expo-secure-store`**
   - **Cause**: Jest config does not mock the native module.
   - **Fix**: Add to `jest.setup.ts`:
   ```ts
   jest.mock('expo-secure-store', () => require('path/to/mockSecureStore'));
   ```

2. **`act()` warning in component tests**
   - **Cause**: State updates (e.g., navigation, async fetch) happen outside React's act scope.
   - **Fix**: Wrap triggers in `await act(async () => { ... })` or use `waitFor` which includes act internally.

3. **Navigation mock not working**
   - **Cause**: Wrong import path or missing `jest.mock('@react-navigation/native')`.
   - **Fix**:
   ```ts
   jest.mock('@react-navigation/native', () => ({
     useNavigation: () => mockNavigation,
   }));
   ```

4. **QueryClient cache polluting tests**
   - **Cause**: Reusing the same `QueryClient` across tests.
   - **Fix**: Create a fresh client per test via `renderWithProviders` helper.

5. **Timer tests flaky (countdown timer)**
   - **Cause**: Real timers cause nondeterministic delays.
   - **Fix**: Use `jest.useFakeTimers()` and advance time with `jest.advanceTimersByTime(ms)`.

6. **Zustand store state leaking between tests**
   - **Cause**: Store not reset.
   - **Fix**: Call `resetDonorStore()` / `resetBloodRequestStore()` in `beforeEach`.

7. **TypeScript errors in test files**
   - **Cause**: Missing `@types/jest` in `tsconfig.json`.
   - **Fix**: Ensure `types` includes `jest`:
   ```json
   {
     "compilerOptions": { "types": ["node", "jest"] }
   }
   ```

8. **RNTL `getByText` fails on Urdu text**
   - **Cause**: Exact match required; Urdu strings contain diacritics.
   - **Fix**: Use `{ exact: false }` or a regex:
   ```ts
   getByText(/bloodlink/i, { exact: false })
   ```

---
*Refer to this list when a test fails unexpectedly – the most common pitfalls are covered here.*