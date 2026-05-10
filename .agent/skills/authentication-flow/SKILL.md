# Authentication Flow (Frontend)

## Overview
- What this skill covers
- Language: TypeScript (strict mode)
- Tech: React Native, Expo, JWT, OTP, expo-secure-store, Zustand, React Navigation

## When To Use This Skill
- Starting auth from scratch
- Adding phone login to BloodLink
- Fixing auth bugs (token, OTP, navigation)

## Screen Flow Diagram
ASCII:
App Launch → SplashScreen → Token exists?
                            ├── YES → HomeScreen
                            └── NO  → LoginScreen → OTPScreen → HomeScreen

## Implementation Steps
1. Install dependencies → [resources/dependencies.md](resources/dependencies.md)
2. Build SplashScreen → [examples/SplashScreen.tsx](examples/SplashScreen.tsx)
3. Build LoginScreen → [examples/LoginScreen.tsx](examples/LoginScreen.tsx)
4. Build OTPScreen → [examples/OTPScreen.tsx](examples/OTPScreen.tsx)
5. Setup Navigation → [examples/AuthNavigator.tsx](examples/AuthNavigator.tsx)
6. Setup authService → [examples/authService.ts](examples/authService.ts)
7. Setup Zustand store → [examples/authStore.ts](examples/authStore.ts)
8. Setup useAuth hook → [examples/useAuth.ts](examples/useAuth.ts)

## API Reference
See → [resources/api-contracts.md](resources/api-contracts.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] Dependencies installed
- [ ] Folder structure created
- [ ] SplashScreen done
- [ ] LoginScreen done
- [ ] OTPScreen done
- [ ] AuthNavigator done
- [ ] authService done
- [ ] authStore done
- [ ] useAuth hook done
- [ ] Full flow tested on device