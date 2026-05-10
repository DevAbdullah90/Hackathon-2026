# Store Architecture

## 1. Zustand vs TanStack Query
- **Zustand** manages UI‑level state: selections, flags, temporary data that lives only in the client.
- **TanStack Query** handles server‑fetched data, caching, automatic refetching and synchronization with the backend.

## 2. TanStack Query v5 Setup
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 s before data is considered stale
      gcTime: 5 * 60_000, // keep unused data for 5 min
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProvider: React.FC = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

## 3. Key Queries with Types
```tsx
import { useQuery } from '@tanstack/react-query';
import { Donor, BloodGroup } from '../types/donor.types';
import { BloodRequest } from '../types/request.types';

export const useNearbyDonors = (bloodGroup: BloodGroup, city: string) =>
  useQuery<Donor[], Error>({
    queryKey: ['donors', 'nearby', bloodGroup, city],
    queryFn: () => donorApi.getNearby(bloodGroup, city),
    staleTime: 30_000,
    enabled: !!bloodGroup && !!city,
  });

export const useActiveRequest = (requestId: string) =>
  useQuery<BloodRequest, Error>({
    queryKey: ['request', requestId],
    queryFn: () => requestApi.getActive(requestId),
    refetchInterval: 10_000, // keep UI up‑to‑date
    enabled: !!requestId,
  });
```

## 4. Connecting Query to Store
```tsx
const { data: donors } = useNearbyDonors(selectedBloodGroup, selectedCity);
useEffect(() => {
  if (donors) {
    useDonorStore.getState().setDonors(donors);
    useMapStore.getState().buildMarkersFromDonors(donors);
  }
}, [donors]);
```

## 5. Store Reset on Logout
```tsx
import { useLogoutAllStores } from '../hooks/useStores';

const LogoutButton: React.FC = () => {
  const logoutAll = useLogoutAllStores();
  const handleLogout = () => {
    // ...run any server‑side logout API
    logoutAll();
  };
  return <Button onPress={handleLogout}>Logout</Button>;
};
```

**Key points**
- Keep server data out of Zustand; only store UI selections.
- Always reset Zustand stores on logout to avoid leaking personal data.
- Use the `use*Query` hooks to fetch and then feed results into the appropriate Zustand store.
