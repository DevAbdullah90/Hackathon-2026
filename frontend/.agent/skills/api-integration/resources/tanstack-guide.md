# TanStack Query v5 TypeScript Guide

## 1. useQuery vs useMutation
- **useQuery** is for fetching (GET) data. It returns `data`, `isLoading`, `error`, etc.
- **useMutation** is for creating/updating/deleting (POST, PATCH, DELETE). It returns `mutate`, `isLoading`, `error`, and callbacks like `onSuccess`.

```tsx
// Example useQuery
const { data, isLoading } = useQuery<Data, ApiError>({ queryKey: [...], queryFn: fetchFn });

// Example useMutation
const mutation = useMutation<Response, ApiError, Variables>({ mutationFn: postFn });
```

## 2. TypeScript Generics
- Always provide both **DataType** and **ErrorType** generic parameters.
- For mutations, add a third generic for **VariablesType**.

```ts
useQuery<User[], ApiError>({ ... });
useMutation<LoginResponse, ApiError, LoginPayload>({ ... });
```

## 3. queryKey Strategy
A stable, descriptive `queryKey` enables cache sharing and invalidation.
- Donors list: `['donors', 'nearby', bloodGroup, city]`
- Single donor: `['donor', donorId]`
- Request details: `['request', requestId]`
- User requests: `['requests', 'mine']`

## 4. Invalidation After Mutation
```ts
const queryClient = useQueryClient();
mutation.mutate(vars, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['requests', 'mine'] });
    queryClient.invalidateQueries({ queryKey: ['donors', 'nearby'] });
  },
});
```

## 5. Polling Strategy
| Data | Refetch Interval |
|------|------------------|
| Nearby donors | 60 s (availability changes) |
| Active request status | 10 s (fast updates) |
| User request list | none |
| Donor profile | none |

## 6. Error Handling with Types
Define a shared `ApiError` type:
```ts
export interface ApiError extends Error {
  userMessage?: string; // friendly UI message
  status?: number;
}
```
In components:
```tsx
if (error) {
  const msg = (error as ApiError).userMessage ?? 'Something went wrong';
  showToast(msg);
}
```

## 7. Loading States
- **isLoading**: first load, no cache.
- **isFetching**: background refetch (polling, manual refetch).
Use skeleton loaders for `isLoading` and spinner overlays for `isFetching` when appropriate.

---
### Quick Reference Snippets
```tsx
// useQuery with staleTime & enabled
useQuery<Data, ApiError>({
  queryKey: ['donors', 'nearby', bg, city],
  queryFn: fetchFn,
  staleTime: 30_000,
  enabled: !!bg && !!city,
});

// useMutation with onSuccess invalidation
useMutation<Response, ApiError, Vars>({
  mutationFn: postFn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['requests', 'mine'] });
  },
});
```
