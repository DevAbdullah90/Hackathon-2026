# Common TypeScript Errors and Fixes

1. **JWTPayload type error on manual decode**
   - `atob` returns `string`; parsing yields `any`. Cast to `JWTPayload` after `JSON.parse`.
   - Fix: `const payload = JSON.parse(decoded) as JWTPayload;`

2. **Zustand store not typed with generic**
   - `create()` without `<SessionState>` loses type safety.
   - Fix: `create<SessionState>()` and define the state interface.

3. **AppInitializer children prop type error**
   - Missing `ReactNode` type for `children`.
   - Fix: `interface AppInitializerProps { children: React.ReactNode; }`

4. **useSession causing infinite loop**
   - Missing dependency array in `useEffect` leads to re‑run on every render.
   - Fix: add `[]` as second argument to `useEffect`.

5. **SecureStore returns `null` but type expects `string`**
   - Directly assigning result to a `string` variable causes type mismatch.
   - Fix: use `const token: string | null = await SecureStore.getItemAsync(...);` and handle `null` case.

6. **ProtectedRoute redirecting logged‑in users**
   - `sessionChecked` false can trigger redirect before session is verified.
   - Fix: ensure `ProtectedRoute` checks both `isLoggedIn` and `sessionChecked`.

7. **Token refresh loop on 401**
   - Interceptor retries the refresh endpoint itself, causing recursion.
   - Fix: skip refresh logic for `/api/auth/refresh` path.

8. **JSON.parse failing on stored user**
   - Saved user may not be stringified correctly.
   - Fix: always `JSON.stringify` before `SecureStore.setItemAsync` and safely `JSON.parse` with try/catch.
