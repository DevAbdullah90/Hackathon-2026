# Event Handling (Frontend)

## Overview
- What this skill covers
- Language: TypeScript (strict mode)
- Tech: React Native AppState, NetInfo, expo-location, expo-notifications, FCM
- BloodLink event domains:
  * Donor Response Events → accept/decline request
  * Emergency Alert Events → critical blood needed
  * Location Events → user location updates
  * Notification Events → FCM push messages
  * App State Events → foreground/background
  * Network Events → online/offline detection

## When To Use This Skill
- Donor accepts request → update UI immediately
- Emergency alert arrives → show red banner
- App comes to foreground → refresh donor list
- Network drops → show offline warning
- Location changes → update nearby donors

## Event Flow Diagram
```
External Event (FCM / Location / AppState / Network)
              ↓
        Event Handler (typed)
              ↓
     Update Zustand Store (typed)
              ↓
      UI Re-renders Automatically
```

## Implementation Steps
1. Handle donor responses → [examples/handlers/donorResponseHandler.ts](examples/handlers/donorResponseHandler.ts)
2. Handle emergency alerts → [examples/handlers/emergencyAlertHandler.ts](examples/handlers/emergencyAlertHandler.ts)
3. Handle location events → [examples/handlers/locationEventHandler.ts](examples/handlers/locationEventHandler.ts)
4. Handle app state → [examples/hooks/useAppStateEvents.ts](examples/hooks/useAppStateEvents.ts)
5. Handle network events → [examples/hooks/useNetworkEvents.ts](examples/hooks/useNetworkEvents.ts)
6. Handle notifications → [examples/hooks/useNotificationEvents.ts](examples/hooks/useNotificationEvents.ts)
7. Add NetworkBanner → [examples/components/NetworkBanner.tsx](examples/components/NetworkBanner.tsx)

## Event Types Reference
See → [resources/event-types.md](resources/event-types.md)

## Event Patterns Guide
See → [resources/event-patterns.md](resources/event-patterns.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] donorResponseHandler setup
- [ ] emergencyAlertHandler setup
- [ ] locationEventHandler setup
- [ ] useAppStateEvents hook working
- [ ] useNetworkEvents hook working
- [ ] useNotificationEvents hook working
- [ ] NetworkBanner component working
- [ ] All handlers cleanup on unmount
- [ ] No memory leaks from listeners
- [ ] All events update Zustand store correctly
- [ ] UI reacts to all events automatically