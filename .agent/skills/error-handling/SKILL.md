# Error Handling (Frontend)

## Overview
- What this skill covers
- Language: TypeScript
- Tech: React Error Boundary, axios interceptors, Zustand error state, expo-error-reporter
- BloodLink error domains:
  * Network Errors → no internet, timeout, server down
  * Auth Errors → token expired, unauthorized
  * API Errors → validation failed, not found, server error
  * UI Errors → component crash, render failure
  * Location Errors → permission denied, GPS unavailable

## When To Use This Skill
- API call fails → show user-friendly message
- Token expires → redirect to login silently
- Component crashes → show fallback screen
- No internet → show offline error with retry
- Location denied → guide user to enable it

## Error Handling Architecture
```
Error Occurs
     ↓
Which Layer?
├── Component crash  → ErrorBoundary catches it
├── API error        → apiErrorHandler processes it
├── Auth error       → authErrorHandler redirects
├── Network error    → NetworkError shown + retry
└── Unknown error    → globalErrorHandler logs it
         ↓
    ErrorToast / ErrorScreen shown to user
         ↓
    User sees friendly message (not raw error)
```

## Implementation Steps
1. Define error classes → [examples/errors/AppError.ts](examples/errors/AppError.ts)
2. Define NetworkError → [examples/errors/NetworkError.ts](examples/errors/NetworkError.ts)
3. Define AuthError → [examples/errors/AuthError.ts](examples/errors/AuthError.ts)
4. Define ApiError → [examples/errors/ApiError.ts](examples/errors/ApiError.ts)
5. Setup global handler → [examples/handlers/globalErrorHandler.ts](examples/handlers/globalErrorHandler.ts)
6. Setup API handler → [examples/handlers/apiErrorHandler.ts](examples/handlers/apiErrorHandler.ts)
7. Setup auth handler → [examples/handlers/authErrorHandler.ts](examples/handlers/authErrorHandler.ts)
8. Add ErrorBoundary → [examples/components/ErrorBoundary.tsx](examples/components/ErrorBoundary.tsx)
9. Add ErrorScreen → [examples/components/ErrorScreen.tsx](examples/components/ErrorScreen.tsx)
10. Add ErrorToast → [examples/components/ErrorToast.tsx](examples/components/ErrorToast.tsx)
11. Use useErrorHandler → [examples/hooks/useErrorHandler.ts](examples/hooks/useErrorHandler.ts)
12. Use useApiError → [examples/hooks/useApiError.ts](examples/hooks/useApiError.ts)

## Error Types Reference
See → [resources/error-types.md](resources/error-types.md)

## Error Patterns Guide
See → [resources/error-patterns.md](resources/error-patterns.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] All error classes defined
- [ ] globalErrorHandler setup
- [ ] apiErrorHandler attached to axios
- [ ] authErrorHandler redirects on 401
- [ ] ErrorBoundary wrapping all screens
- [ ] ErrorScreen for full-page errors
- [ ] ErrorToast for inline errors
- [ ] useErrorHandler hook working
- [ ] useApiError hook working
- [ ] No raw error messages shown to user
- [ ] All errors logged properly
- [ ] Urdu error messages added