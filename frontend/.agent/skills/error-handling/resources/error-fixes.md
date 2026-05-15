# Common TypeScript Error Fixes for BloodLink

1. **`unknown` not assignable to `AppError`**
   - **Cause**: Catch block receives `unknown` and is assigned directly.
   - **Fix**: Use `handleUnknownError(e)` to convert before storing.
   ```ts
   try { await fn() } catch (e) {
     const appErr = handleUnknownError(e)
     setError(appErr)
   }
   ```

2. **`ErrorBoundary` not catching async errors**
   - **Cause**: Async errors thrown inside `useEffect` or event handlers bypass render cycle.
   - **Fix**: Wrap async calls with `try/catch` and forward to `setError`.
   ```ts
   const load = async () => {
     try { await fetchData() } catch (e) { setError(e) }
   }
   ```

3. **Urdu text rendering left‑to‑right**
   - **Cause**: Missing `writingDirection: 'rtl'` on Urdu `Text` components.
   - **Fix**: Add `writingDirection="rtl"` prop.
   ```tsx
   <Text writingDirection="rtl">{error.urduMessage}</Text>
   ```

4. **Validation errors not mapped to correct fields**
   - **Cause**: FastAPI returns `loc` array with nested objects, but mapper uses last element directly.
   - **Fix**: Ensure mapper extracts the field name correctly.
   ```ts
   const field = item.loc?.[item.loc.length - 1] ?? 'field'
   ```

5. **Toast not auto‑dismissing**
   - **Cause**: `setTimeout` cleared incorrectly or missing cleanup.
   - **Fix**: Use `useEffect` with cleanup to clear timer.
   ```ts
   useEffect(() => {
     const timer = setTimeout(dismiss, duration)
     return () => clearTimeout(timer)
   }, [error])
   ```

6. **Error state not cleared after retry**
   - **Cause**: `clearError` not called before re‑executing action.
   - **Fix**: Call `clearError()` then perform retry logic.

7. **`isAuthError` type guard fails across modules**
   - **Cause**: Multiple copies of `AuthError` class due to duplicate imports.
   - **Fix**: Ensure a single source of truth: import from `../errors/AuthError` everywhere.
   ```ts
   import { AuthError } from '../errors/AuthError'
   ```
