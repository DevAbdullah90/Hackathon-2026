# Common TypeScript Errors & Fixes for TanStack Query

1. **Missing generic types on `useQuery`**
   ```ts
   const { data } = useQuery(fetchFn);
   ```
   **Fix**: Provide both data and error generics.
   ```ts
   const { data } = useQuery<DataType, ApiError>({ queryKey: [...], queryFn: fetchFn });
   ```

2. **`queryFn` return type mismatch**
   ```ts
   queryFn: () => fetchData(), // returns any
   ```
   **Fix**: Ensure `queryFn` returns `Promise<DataType>`.
   ```ts
   queryFn: async () => {
     const res = await api.get();
     return res.data; // typed as DataType
   }
   ```

3. **`useMutation` variables type error**
   ```ts
   const mutation = useMutation(mutateFn);
   ```
   **Fix**: Add third generic for variables.
   ```ts
   const mutation = useMutation<ResponseType, ApiError, VariablesType>({
     mutationFn: mutateFn,
   });
   ```

4. **`error.userMessage` not found**
   ```ts
   if (error.userMessage) {...}
   ```
   **Fix**: Cast error to `ApiError`.
   ```ts
   const apiError = error as ApiError;
   if (apiError.userMessage) {...}
   ```

5. **`enabled` prop set to undefined causing query to run always**
   ```ts
   enabled: someValue // may be undefined
   ```
   **Fix**: Coerce to boolean.
   ```ts
   enabled: !!someValue,
   ```

6. **`refetchInterval` type error**
   ```ts
   refetchInterval: '60s'
   ```
   **Fix**: Use number of milliseconds.
   ```ts
   refetchInterval: 60_000,
   ```

7. **`onSuccess` data type is `unknown`**
   ```ts
   onSuccess: (data) => {...}
   ```
   **Fix**: Provide explicit generic on `useQuery`.
   ```ts
   useQuery<DataType, ApiError>({ ..., onSuccess: (data) => {...} });
   ```

8. **`invalidateQueries` queryKey type error**
   ```ts
   queryClient.invalidateQueries('donors');
   ```
   **Fix**: Pass an object with `queryKey` array.
   ```ts
   queryClient.invalidateQueries({ queryKey: ['donors'] });
   ```
