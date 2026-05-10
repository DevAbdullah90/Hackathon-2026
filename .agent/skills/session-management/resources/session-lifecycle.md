# Session Lifecycle

## 1. First App Launch
- No token stored in SecureStore.
- `AppInitializer` runs, `getSession()` returns `null`.
- Navigation moves to **LoginScreen**.
- User completes OTP flow and receives a JWT.
- `saveSession(token, user)` is called.
- `sessionStore` is updated via `setSession`.
- Navigation proceeds to **HomeScreen**.

## 2. App Restart (Valid Token)
- `AppInitializer` invokes `getSession()` and finds a token.
- `isTokenExpired(token)` returns `false`.
- Store is populated with user data and token via `setSession`.
- `sessionChecked` is set to `true` and **HomeScreen** renders.

## 3. App Restart (Expired Token)
- `AppInitializer` finds a token but `isTokenExpired(token)` is `true`.
- `refreshToken()` is called silently.
- On success, the new token is saved with `SecureStore.setItemAsync('bl_token', newToken)` and store updated.
- User stays on **HomeScreen** – no visible interruption.

## 4. Token Expires During Active Use
- An API request receives a **401** response.
- Axios response interceptor triggers token refresh.
- On success the original request is retried with the new token.
- UI remains responsive; user sees no auth error.

## 5. Both Tokens Expired
- Refresh request fails (e.g., refresh endpoint returns 401 or network error).
- `clearSession()` removes stored token and user data.
- Store is cleared via `clearSession` action.
- Navigation redirects to **LoginScreen**.
- A toast informs the user: "Session expired. Please login again." (also displayed in Urdu: "سیشن ختم ہو گیا۔ دوبارہ لاگ ان کریں۔")

### Additional Details
- JWT payload is decoded manually; `exp` is compared against the current epoch time.
- A small buffer (e.g., 5 minutes) can be added to `isTokenExpired` to pre‑emptively refresh before strict expiry.
- Keys used in SecureStore are `bl_token` for the JWT and `bl_user` for the serialized user object.
- All navigation actions use React Navigation's `navigate` method.
- The red theme `#DC2626` is applied consistently to loading spinners and branding elements.
