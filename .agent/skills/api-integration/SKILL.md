# API Integration (Frontend)

## Overview
- What this skill covers
- Language: TypeScript (strict mode)
- Tech: axios, TanStack Query v5
- Two layers:
  * API Layer → typed axios functions
  * Query Layer → typed TanStack Query hooks

## When To Use This Skill
- Fetching nearby donors from backend
- Submitting blood requests
- Polling for real-time donor availability
- Handling loading, error, success states

## API Architecture Diagram
```
Component
    ↓ calls
useNearbyDonors() hook       ← TanStack Query (typed)
    ↓ calls
donorApi.getNearby()         ← typed axios function
    ↓ calls
apiClient (axios instance)   ← base config + interceptors
    ↓ hits
FastAPI Backend
```

## Implementation Steps
1. Setup axios client → [examples/client/apiClient.ts](examples/client/apiClient.ts)
2. Setup QueryClient → [examples/client/queryClient.ts](examples/client/queryClient.ts)
3. Create donor API → [examples/api/donorApi.ts](examples/api/donorApi.ts)
4. Create request API → [examples/api/bloodRequestApi.ts](examples/api/bloodRequestApi.ts)
5. Create useNearbyDonors → [examples/hooks/useNearbyDonors.ts](examples/hooks/useNearbyDonors.ts)
6. Create useBloodRequests → [examples/hooks/useBloodRequests.ts](examples/hooks/useBloodRequests.ts)
7. Create useDonorProfile → [examples/hooks/useDonorProfile.ts](examples/hooks/useDonorProfile.ts)

## All API Endpoints
See → [resources/api-endpoints.md](resources/api-endpoints.md)

## TanStack Query Guide
See → [resources/tanstack-guide.md](resources/tanstack-guide.md)

## Common Errors
See → [resources/error-fixes.md](resources/error-fixes.md)

## Checklist
- [ ] apiClient.ts setup with interceptors
- [ ] queryClient.ts configured
- [ ] QueryClientProvider wrapping App root
- [ ] donorApi.ts complete and typed
- [ ] bloodRequestApi.ts complete and typed
- [ ] useNearbyDonors hook working
- [ ] useBloodRequests hook working
- [ ] useDonorProfile hook working
- [ ] Loading states handled in UI
- [ ] Error states handled in UI
- [ ] Token auto-attached to every request
- [ ] All responses strictly typed