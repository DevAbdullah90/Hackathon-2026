# Navigation Setup (Frontend)

## Overview
- What this skill covers
- Language: TypeScript (strict mode)
- Tech: React Navigation v6, Native Stack, Bottom Tabs, Deep Linking

## When To Use This Skill
- Setting up BloodLink screen structure
- Adding new screen to the app
- Passing params between screens
- Handling deep links from notifications

## BloodLink Screen Structure
```
RootNavigator
├── AuthNavigator (Stack)
│   ├── SplashScreen
│   ├── LoginScreen
│   └── OTPScreen
└── AppNavigator (Stack)
    ├── TabNavigator (Bottom Tabs)
    │   ├── HomeScreen         (tab 1)
    │   ├── MapScreen          (tab 2)
    │   ├── RequestScreen      (tab 3)
    │   └── ProfileScreen      (tab 4)
    ├── DonorProfileScreen     (modal)
    ├── RequestStatusScreen    (modal)
    ├── EmergencyScreen        (modal)
    └── NotificationsScreen    (stack)
```

## Implementation Steps
1. Define all navigation types → [examples/types/navigation.types.ts](examples/types/navigation.types.ts)
2. Setup RootNavigator → [examples/navigators/RootNavigator.tsx](examples/navigators/RootNavigator.tsx)
3. Setup AuthNavigator → [examples/navigators/AuthNavigator.tsx](examples/navigators/AuthNavigator.tsx)
4. Setup AppNavigator → [examples/navigators/AppNavigator.tsx](examples/navigators/AppNavigator.tsx)
5. Setup TabNavigator → [examples/navigators/TabNavigator.tsx](examples/navigators/TabNavigator.tsx)
6. Use navigation hook → [examples/hooks/useAppNavigation.ts](examples/hooks/useAppNavigation.ts)

## Screen Map Reference
See → [resources/screen-map.md](resources/screen-map.md)

## Navigation Patterns
See → [resources/navigation-patterns.md](resources/navigation-patterns.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] navigation.types.ts defined
- [ ] RootNavigator working
- [ ] AuthNavigator working
- [ ] AppNavigator working
- [ ] TabNavigator with 4 tabs working
- [ ] Tab icons showing correctly
- [ ] useAppNavigation hook working
- [ ] Params passing between screens typed
- [ ] Notification deep link navigates correctly
- [ ] No header shown on auth screens