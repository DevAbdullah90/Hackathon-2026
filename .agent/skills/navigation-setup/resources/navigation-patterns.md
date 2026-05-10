# Navigation Patterns

## 1. Typed Navigation Pattern
```tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation.types';

const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
navigation.navigate('DonorProfile', { donorId: 'abc123' });
```
Always type the navigation prop so TypeScript validates the screen name and params.

## 2. Typed Route Params Pattern
```tsx
import { useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../types/navigation.types';

type Route = RouteProp<AppStackParamList, 'DonorProfile'>;
const { params } = useRoute<Route>();
const { donorId } = params; // donorId is typed as string
```
Provides safe access to route parameters.

## 3. Navigate from Notification Pattern
```tsx
// Notification handler receives a requestId
function handleNotificationTap(requestId: string) {
  const { goToRequestStatus } = useAppNavigation();
  goToRequestStatus(requestId);
}
```
Keeps navigation logic in a single hook, making it easy to reuse.

## 4. Reset Navigation on Login/Logout
```tsx
import { CommonActions } from '@react-navigation/native';

// After successful login
navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'App' }],
  })
);
```
Reset clears the history so users cannot go back to the login screens.

## 5. Conditional Tab Badge Pattern
```tsx
<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
  }}
/>
```
Shows a numeric badge only when there are unread notifications.
