# Session Management (Frontend)

## Overview
- What this skill covers
- Language: TypeScript (strict mode)
- Tech: expo-secure-store, Zustand, axios interceptors, JWT decode, React Navigation

## When To Use This Skill
- Persisting login across app restarts
- Handling JWT expiry silently
- Protecting screens from unauthenticated access
- Managing BloodLink donor/patient session

## Session Lifecycle Diagram
```
App Launch → Load token from SecureStore
                    ↓
             Token found?
          ├── NO  → LoginScreen
          └── YES → Token valid?
                    ├── YES → HomeScreen
                    └── NO  → Refresh Token?
                              ├── Success → HomeScreen
                              └── Fail → Logout → LoginScreen
```

## Implementation Steps
1. Setup sessionService → [examples/sessionService.ts](examples/sessionService.ts)
2. Setup Zustand store → [examples/sessionStore.ts](examples/sessionStore.ts)
3. Create useSession hook → [examples/useSession.ts](examples/useSession.ts)
4. Create AppInitializer → [examples/AppInitializer.tsx](examples/AppInitializer.tsx)
5. Create ProtectedRoute → [examples/ProtectedRoute.tsx](examples/ProtectedRoute.tsx)
6. Add TokenRefreshHandler → [examples/TokenRefreshHandler.tsx](examples/TokenRefreshHandler.tsx)

## Session Lifecycle Details
See → [resources/session-lifecycle.md](resources/session-lifecycle.md)

## Security Rules
See → [resources/security-checklist.md](resources/security-checklist.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] sessionService.ts created
- [ ] sessionStore.ts created
- [ ] useSession.ts hook created
- [ ] Axios interceptor attached
- [ ] AppInitializer working
- [ ] ProtectedRoute working
- [ ] TokenRefreshHandler working
- [ ] Logout clears all session data
- [ ] Session persists after app restart
- [ ] Expired token handled silently