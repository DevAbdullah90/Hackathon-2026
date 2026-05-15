# Common TypeScript Errors & Fixes in BloodLink State Management

1. **Zustand `create` missing generic**
   ```ts
   // Wrong
   const useStore = create(() => ({ ... }));
   // Correct
   const useStore = create<StoreType>(() => ({ ... }));
   ```
   *Fix*: Add the explicit generic `create<YourStoreState>()`.

2. **`BloodGroup` string not assignable**
   ```ts
   const bg: BloodGroup = 'A++'; // error
   ```
   *Fix*: Validate or cast only to the defined union values.

3. **`Donor[]` type error in `setDonors`**
   - Ensure the `Donor` interface is imported from `donor.types.ts`.
   - Use the exact type name (`Donor[]`).

4. **`buildMarkersFromDonors` return type mismatch**
   ```ts
   const markers: MapMarker[] = donors.map(...);
   ```
   *Fix*: Confirm each property matches `MapMarker` definition.

5. **`useStores` causing too many re‑renders**
   - Use selectors (`useDonorStore(state => state.donors)`) inside components instead of pulling the whole state.
   - Keep `useStores` for static snapshots only.

6. **`unreadCount` going negative**
   ```ts
   // Wrong
   state.unreadCount -= 1;
   ```
   *Fix*: Guard with `Math.max(0, state.unreadCount - 1)`.

7. **`toggleEmergencyMode` type error**
   ```ts
   set(state => ({ isEmergencyMode: !state.isEmergencyMode }));
   ```
   *Fix*: Ensure the updater returns the correct shape; the above is correct when `state` is typed.

8. **TanStack Query generic types missing**
   ```ts
   // Wrong
   useQuery(() => fetch(...));
   // Correct
   useQuery<DataType, ErrorType>({ queryKey: [...], queryFn: ... });
   ```
   *Fix*: Provide both data and error generic parameters.

**Tip**: When you see a TypeScript error, first check that the imported type matches the file path and that all required properties are present.
