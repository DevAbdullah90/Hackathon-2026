# TypeScript Specific Errors and Fixes

## 1. `AppState.addEventListener` Return Type Error
**Problem:** The listener’s return type is not correctly assigned, causing a type mismatch.
**Fix:** Store the result in a variable typed as the subscription object and call `.remove()` in the cleanup function.
```ts
const subscription = AppState.addEventListener('change', handler);
return () => subscription.remove();
```

## 2. `FCM` Data is `unknown`
**Problem:** Accessing properties on `data` throws `Property 'foo' does not exist on type 'unknown'`.
**Fix:** Use a type guard before accessing any fields.
```ts
function isEmergencyMessage(data: Record<string, unknown>): data is EmergencyAlertData {
  return data.type === 'emergency' && typeof data.bloodGroup === 'string';
}
```

## 3. `Location.watchPositionAsync` Return Type
**Problem:** The function returns `Promise<LocationSubscription>` but the code treats it as a plain object.
**Fix:** `await` the promise and type the resulting variable.
```ts
const subscription = await Location.watchPositionAsync(options, callback);
```

## 4. `NetInfoState.isConnected` Can Be `null`
**Problem:** Directly checking `if (state.isConnected)` fails because `isConnected` may be `null`.
**Fix:** Explicitly compare to `true`.
```ts
const isOnline = state.isConnected === true;
```

## 5. `Notifications.Notification` Data is `unknown`
**Problem:** Accessing `notification.request.content.data` yields an error.
**Fix:** Cast after a type guard.
```ts
const raw = notification.request.content.data as Record<string, unknown>;
if (isEmergencyMessage(raw)) { /* safe */ }
```

## 6. `Vibration` Import Error
**Problem:** `import { Vibration } from 'react-native'` not found because of missing export.
**Fix:** Ensure `Vibration` is exported by the version of React Native you’re using; otherwise install `expo-sensors` or a compatible polyfill.

## 7. `writingDirection` Not Supported by NativeWind
**Problem:** NativeWind class names don’t include `writingDirection`.
**Fix:** Apply inline style.
```tsx
<Text style={{ writingDirection: 'rtl' }}>...</Text>
```

## 8. Missing `eventBus` Import
**Problem:** Handlers reference `eventBus` without an import, causing a `Cannot find name 'eventBus'` error.
**Fix:** Add `import { eventBus } from '../../eventBus';` at the top of each file that uses it.

## 9. `mapStore.checkIfMovedAndRefetch` Undefined
**Problem:** Method referenced but not defined in `mapStore`.
**Fix:** Implement the method or replace with appropriate logic inside the location update callback.

## 10. `globalStore.toggleEmergencyMode` Argument Mismatch
**Problem:** Function expects no arguments but is called with a boolean.
**Fix:** Update the function signature to accept a boolean or create separate `enableEmergencyMode`/`disableEmergencyMode` helpers.

These fixes ensure the TypeScript code compiles cleanly and runs under Expo SDK 51+ with strict typing.
