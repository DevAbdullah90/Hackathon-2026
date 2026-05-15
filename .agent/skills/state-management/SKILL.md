# State Management (Frontend)

## Overview
- What this skill covers
- Language: TypeScript (strict mode)
- Tech: Zustand v4, TanStack Query v5
- BloodLink state domains:
  * Donor State → nearby donors, selected donor
  * Blood Request State → active request, status
  * Map State → location, region, markers
  * Notification State → alerts, unread count
  * Global State → language, network, emergency mode

## When To Use This Skill
- Adding new feature needing shared state
- Fixing stale data issues
- Managing real-time donor availability
- Handling blood request status updates

## State Architecture Diagram
ASCII:
Zustand Stores (UI/client state)
├── donorStore          → donor list, selected donor
├── bloodRequestStore   → active request, status
├── mapStore            → location, region, markers
├── notificationStore   → alerts, unread count
└── globalStore         → language, network, emergency

TanStack Query (server/remote state)
├── useNearbyDonors     → GET /api/donors/nearby
├── useBloodRequests    → GET /api/requests
└── useDonorProfile     → GET /api/donors/:id

Rule:
Zustand = UI state and user selections
TanStack Query = anything from backend

## Implementation Steps
1. Define all types → [examples/types/donor.types.ts](examples/types/donor.types.ts)
2. Define request types → [examples/types/request.types.ts](examples/types/request.types.ts)
3. Define store types → [examples/types/store.types.ts](examples/types/store.types.ts)
4. Setup donorStore → [examples/stores/donorStore.ts](examples/stores/donorStore.ts)
5. Setup bloodRequestStore → [examples/stores/bloodRequestStore.ts](examples/stores/bloodRequestStore.ts)
6. Setup mapStore → [examples/stores/mapStore.ts](examples/stores/mapStore.ts)
7. Setup notificationStore → [examples/stores/notificationStore.ts](examples/stores/notificationStore.ts)
8. Setup globalStore → [examples/stores/globalStore.ts](examples/stores/globalStore.ts)
9. Combine with useStores → [examples/hooks/useStores.ts](examples/hooks/useStores.ts)

## Store Architecture Guide
See → [resources/store-architecture.md](resources/store-architecture.md)

## Best Practices
See → [resources/best-practices.md](resources/best-practices.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] All types defined
- [ ] donorStore created and typed
- [ ] bloodRequestStore created and typed
- [ ] mapStore created and typed
- [ ] notificationStore created and typed
- [ ] globalStore created and typed
- [ ] useStores hook created
- [ ] TanStack Query setup done
- [ ] No duplicate state between Zustand and Query
- [ ] All stores reset on logout