# Error Handling Patterns in BloodLink

## 1. Try‑Catch‑Convert Pattern
```ts
try {
  await apiCall()
} catch (e) {
  const appError = handleUnknownError(e)
  setError(appError)
}
```
- Always convert any caught value to an `AppError` before storing or displaying it.
- Guarantees a consistent shape for logging and UI.

## 2. Field Validation Error Pattern
When a FastAPI endpoint returns validation errors:
```ts
const { error, validationErrors } = useApiError()
await apiCall().catch(setApiError)
// In a form field:
<Text>{validationErrors?.phone && getFieldError('phone')}</Text>
```
- `useApiError` extracts `validationErrors` from an `ApiError`.
- UI components call `getFieldError(fieldName)` to display per‑field messages.

## 3. Retry Pattern
```tsx
if (error instanceof NetworkError) {
  return (
    <ErrorScreen
      error={error}
      showRetry
      onRetry={retryFunction}
    />
  )
}
```
- `ErrorScreen` receives `showRetry` and an `onRetry` callback.
- `retryFunction` should clear the error state before re‑executing the failed action.

## 4. Bilingual Error Pattern
Every error class provides `userMessage` (English) and `urduMessage`.
```tsx
<Text>{error.userMessage}</Text>
<Text writingDirection="rtl">{error.urduMessage}</Text>
```
- English displayed first, Urdu below.
- Use `writingDirection: 'rtl'` to render Urdu correctly.

## 5. Silent Error Pattern
Some errors should not interrupt the user (e.g., background location failures).
```ts
if (error instanceof LocationError && error.isSilent) {
  logError(error, 'location')
  // No UI feedback
}
```
- Log for diagnostics, but keep UI clean.
- `isSilent` flag can be added to custom error subclasses when needed.
