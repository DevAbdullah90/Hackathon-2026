# TypeScript Navigation Errors and Fixes

1. **Cannot navigate to screen — not in param list**
   - **Cause:** Screen name missing from the corresponding `ParamList` type.
   - **Fix:** Add the screen entry to the correct `ParamList` (e.g., `AppStackParamList`).

2. **Route params undefined on screen**
   - **Cause:** `useRoute` called without a generic, so `params` is typed as `any`.
   - **Fix:** Use `useRoute<RouteProp<AppStackParamList, 'ScreenName'>>` to get a typed `params` object.

3. **Type error passing params to `navigate()`**
   - **Cause:** Params object does not match the type defined in `ParamList`.
   - **Fix:** Ensure the passed object exactly matches the declared shape, e.g., `navigation.navigate('DonorProfile', { donorId: 'abc' })`.

4. **Tab badge not showing**
   - **Cause:** `tabBarBadge` set to a boolean or string without required styling.
   - **Fix:** Provide a number or string: `tabBarBadge: unreadCount > 0 ? unreadCount : undefined`.

5. **Modal not dismissing on `goBack`**
   - **Cause:** Attempting to navigate away instead of using `navigation.goBack()`.
   - **Fix:** Call `navigation.goBack()` from the modal screen to dismiss it.

6. **`NavigatorScreenParams` import missing**
   - **Cause:** Forgetting to import from `@react-navigation/native`.
   - **Fix:** `import { NavigatorScreenParams } from '@react-navigation/native';`.

7. **Header showing on tab screens**
   - **Cause:** Header not disabled in the parent navigator.
   - **Fix:** Set `headerShown: false` in `AppNavigator` for the `Tabs` screen or in each tab screen's `options`.

8. **Back button showing on OTP screen**
   - **Cause:** Default stack options allow back gestures.
   - **Fix:** In `AuthNavigator`, set `options={{ gestureEnabled: false, headerShown: false }}` for the `OTP` screen.
