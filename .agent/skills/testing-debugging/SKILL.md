# Testing & Debugging (Frontend)

## Overview
- What this skill covers
- Language: TypeScript
- Tech: Jest, React Native Testing Library,
  Expo dev tools, Flipper, React Query DevTools
- BloodLink testing domains:
  * Unit Tests → stores, services, handlers
  * Component Tests → screens, UI components
  * Mock Setup → API, SecureStore, Navigation
  * Debugging → Expo tools, Flipper, network logs

## When To Use This Skill
- Writing tests for auth flow
- Testing donor store state changes
- Mocking API calls in tests
- Debugging network requests
- Finding performance issues
- Testing error boundary behavior

## Testing Architecture
```
BloodLink Tests
├── Unit Tests (Jest)
│   ├── authService.test.ts    → API functions
│   ├── donorStore.test.ts     → Zustand stores
│   └── errorHandler.test.ts  → error classes
├── Component Tests (RNTL)
│   ├── LoginScreen.test.tsx   → user interactions
│   └── OTPScreen.test.tsx     → OTP input flow
└── Mocks
    ├── mockApiClient.ts       → fake axios
    ├── mockSecureStore.ts     → fake storage
    └── mockNavigation.ts     → fake navigation
``` 

## Implementation Steps
1. Setup mocks → [examples/mocks/mockApiClient.ts](examples/mocks/mockApiClient.ts)
2. Setup SecureStore mock → [examples/mocks/mockSecureStore.ts](examples/mocks/mockSecureStore.ts)
3. Setup Navigation mock → [examples/mocks/mockNavigation.ts](examples/mocks/mockNavigation.ts)
4. Setup test helpers → [examples/utils/testHelpers.ts](examples/utils/testHelpers.ts)
5. Setup renderWithProviders → [examples/utils/renderWithProviders.tsx](examples/utils/renderWithProviders.tsx)
6. Write authService tests → [examples/unit-tests/authService.test.ts](examples/unit-tests/authService.test.ts)
7. Write donorStore tests → [examples/unit-tests/donorStore.test.ts](examples/unit-tests/donorStore.test.ts)
8. Write bloodRequestStore tests → [examples/unit-tests/bloodRequestStore.test.ts](examples/unit-tests/bloodRequestStore.test.ts)
9. Write errorHandler tests → [examples/unit-tests/errorHandler.test.ts](examples/unit-tests/errorHandler.test.ts)
10. Write LoginScreen tests → [examples/component-tests/LoginScreen.test.tsx](examples/component-tests/LoginScreen.test.tsx)
11. Write OTPScreen tests → [examples/component-tests/OTPScreen.test.tsx](examples/component-tests/OTPScreen.test.tsx)
12. Write ErrorBoundary tests → [examples/component-tests/ErrorBoundary.test.tsx](examples/component-tests/ErrorBoundary.test.tsx)

## Debugging Guide
See → [resources/debugging-guide.md](resources/debugging-guide.md)

## Testing Patterns
See → [resources/testing-patterns.md](resources/testing-patterns.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] Jest configured for Expo
- [ ] All mocks setup
- [ ] renderWithProviders working
- [ ] authService tests passing
- [ ] donorStore tests passing
- [ ] bloodRequestStore tests passing
- [ ] errorHandler tests passing
- [ ] LoginScreen tests passing
- [ ] OTPScreen tests passing
- [ ] ErrorBoundary tests passing
- [ ] All tests run with npm test