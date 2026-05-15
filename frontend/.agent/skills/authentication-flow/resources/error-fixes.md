# Common TypeScript Errors and Fixes for Authentication Flow

1. **Navigation type error**
   - *Problem:* `useNavigation` generic missing.
   - *Fix:* Import `NativeStackNavigationProp` and type the hook:
     ```ts
     const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Screen'>();
     ```

2. **useRef array null check**
   - *Problem:* `useRef<TextInput[]>` may be `null` causing runtime error.
   - *Fix:* Ensure the ref exists before accessing:
     ```ts
     inputRefs.current?.[index]?.focus();
     ```

3. **expo-secure-store returns null**
   - *Problem:* Functions assume a string is returned.
   - *Fix:* Explicitly handle `null`:
     ```ts
     const token = await SecureStore.getItemAsync('authToken');
     if (!token) { /* handle missing token */ }
     ```

4. **Zustand generic missing**
   - *Problem:* `create()` without generic leads to `any` state.
   - *Fix:* Provide the state interface:
     ```ts
     const useAuthStore = create<AuthState>((set) => ({ ... }));
     ```

5. **Route params undefined on OTP screen**
   - *Problem:* Accessing `route.params` without type safety.
   - *Fix:* Use `useRoute<RouteProp<AuthStackParamList, 'OTP'>>()`.

6. **OTP keyboard numeric on iOS**
   - *Problem:* Using `phone-pad` gives letters.
   - *Fix:* Use `keyboardType="number-pad"` for pure digits.

7. **Navigation reset after login**
   - *Problem:* `navigate` leaves back stack.
   - *Fix:* Use `navigation.reset({ index: 0, routes: [{ name: 'Home' }] });`.
