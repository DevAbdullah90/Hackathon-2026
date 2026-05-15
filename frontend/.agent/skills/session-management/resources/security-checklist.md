# Security Checklist

## Storage Security
- [ ] JWT stored in **expo-secure-store** only
- [ ] User data stored in **expo-secure-store** only
- [ ] No token or user data logged to console or persisted in Zustand logs
- [ ] No usage of AsyncStorage or other insecure storage for sensitive data

## Token Security
- [ ] Token expiry checked on every app launch and before each API call
- [ ] Token transmitted exclusively over HTTPS
- [ ] Authorization header cleared immediately on logout
- [ ] No token appears in any `console.log` statements

## Session Security
- [ ] Logout clears SecureStore entries (`bl_token`, `bl_user`) completely
- [ ] Logout resets the Zustand `sessionStore` to its initial state
- [ ] `ProtectedRoute` applied to every private screen component
- [ ] Backend session invalidated on logout (API call if applicable)

## TypeScript Security
- [ ] No `any` type used in any session‑related file
- [ ] JWT payload interface (`JWTPayload`) strictly typed
- [ ] All SecureStore returns are null‑checked before use
- [ ] All async session operations wrapped in `try/catch` blocks to handle failures gracefully
