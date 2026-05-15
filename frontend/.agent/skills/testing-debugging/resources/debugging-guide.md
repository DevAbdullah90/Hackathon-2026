# Debugging Guide for BloodLink

1. **Expo Dev Tools**
   - Open dev menu: shake device or press **Ctrl+M** (Android) / **Cmd+D** (iOS) in the simulator.
   - Enable/disable **Fast Refresh** to see changes instantly.
   - Use **JS Debugger**: select *Debug Remote JS* to open Chrome/Edge devtools.
   - **Network Inspector**: view API calls under the *Network* tab in Expo Go.

2. **React Native Debugger**
   - Install from https://github.com/jhen0409/react-native-debugger.
   - Run `rndebugger-open` and ensure the packager is started with `REACT_DEBUGGER=1`.
   - Connect to the Expo app (default port 8081).
   - Inspect **Redux/Zustand** state via the *Redux* tab.
   - Use the *Network* tab to monitor fetch/axios requests.

3. **Flipper Setup**
   - Download Flipper from https://fbflipper.com/.
   - Add `react-native-flipper` to the app dependencies.
   - Launch Flipper and open the app – it should appear under *Devices*.
   - **Network plugin**: see all HTTP requests/responses.
   - **React DevTools plugin**: explore component hierarchy.
   - **Crash Reporter plugin**: view native crashes.

4. **TanStack Query DevTools**
   - Install `@tanstack/react-query-devtools` if not already.
   - Add `<ReactQueryDevtools initialIsOpen={false} />` inside your root component.
   - Inspect active queries, cache data, and manually invalidate queries.

5. **Common Debugging Scenarios**
   - **API call not firing** → check *Network* tab in Expo Dev Tools or Flipper.
   - **State not updating** → verify Zustand store mutations; use React Native Debugger to view store.
   - **Navigation not working** → ensure correct screen names and navigation prop usage.
   - **Token not attached** → inspect Axios interceptor configuration.
   - **Map not showing donors** → check `mapStore` state and map component props.

6. **Console Logging Strategy**
   - Log request/response objects in development (`if (__DEV__) console.log(...)`).
   - Never log sensitive data (tokens, passwords).
   - Use a structured format: `{ action: 'fetchDonors', payload: {...} }`.
   - For production, strip logs with Babel plugin or Metro config.

7. **Performance Tips**
   - Use **Flipper** *Performance* plugin to monitor frame rates.
   - Profile heavy renders with React DevTools "Highlight updates".
   - Ensure **FlatList** keys are stable and use `getItemLayout` when possible.

8. **Crash Reporting**
   - Integrate Sentry or Firebase Crashlytics.
   - Verify error boundaries catch UI errors and report via `globalErrorHandler`.

9. **Testing Debugging**
   - Run `npm test -- --watch` to re-run failing tests.
   - Use `jest --verbose` for detailed output.
   - Mock timers with `jest.useFakeTimers()` for countdown logic.
   - Verify that mock implementations are reset between tests.

---
*Keep this guide handy when you hit a snag – it outlines the tools and steps to quickly locate the problem.*