# TypeScript Event Patterns

## 1. Subscribe‑Handle‑Cleanup Pattern
```tsx
useEffect(() => {
  const subscription = AppState.addEventListener(
    'change',
    (state: AppStateStatus) => handleStateChange(state)
  );
  return () => subscription.remove();
}, []);
```
**Why:** Guarantees a cleanup function is returned, satisfying React's expectations and preventing memory leaks.

## 2. Type Guard Pattern for FCM
```ts
function isEmergencyMessage(
  data: Record<string, unknown>
): data is EmergencyAlertData {
  return (
    data.type === 'emergency' && typeof data.bloodGroup === 'string'
  );
}
```
**Why:** FCM payloads are `unknown`; a type guard safely narrows the type before accessing properties.

## 3. Event → Store → UI Pattern
```
FCM arrives (unknown) → type guard narrows → handler updates stores → UI components subscribed to stores re‑render automatically.
```
**Why:** Keeps UI logic declarative and avoids direct DOM manipulation from event listeners.

## 4. Cleanup Return Pattern
```ts
const useXxxEvents = () => {
  useEffect(() => {
    const sub = setupListener();
    return () => sub.remove(); // Enforces cleanup
  }, []);
};
```
**Why:** TypeScript enforces the return type `() => void`, making it explicit that cleanup occurs.

## 5. Debounce Location Pattern
```ts
Location.watchPositionAsync({
  accuracy: Location.Accuracy.High,
  distanceInterval: 500, // only fire when moved >500 m
});
```
**Why:** Saves battery on devices in Pakistan where GPS can be noisy; updates are only needed when the user moves a noticeable distance.
