# Screen Map

## AUTH SCREENS
- **SplashScreen**
  - Route name: `Splash`
  - Params: none
  - Shows loading indicator, checks session token, redirects to either `App` or `Auth` flow.
- **LoginScreen**
  - Route name: `Login`
  - Params: none
  - UI for phone number entry, initiates OTP request.
- **OTPScreen**
  - Route name: `OTP`
  - Params: `{ phone: string }`
  - 6‑digit verification input, validates code, logs user in.

## TAB SCREENS
- **HomeScreen**
  - Route name: `Home`
  - Params: none
  - Dashboard showing recent blood requests, donation stats.
- **MapScreen**
  - Route name: `Map`
  - Params: `{ bloodGroup?: BloodGroup }`
  - Displays Google Maps with nearby donor markers; optional filter by blood group.
- **RequestScreen**
  - Route name: `Request`
  - Params: none
  - Form to create a new blood request (type, volume, location).
- **ProfileScreen**
  - Route name: `Profile`
  - Params: none
  - User profile, donation history, settings.

## MODAL SCREENS
- **DonorProfileScreen**
  - Route name: `DonorProfile`
  - Params: `{ donorId: string }`
  - Shows detailed donor info, contact actions.
- **RequestStatusScreen**
  - Route name: `RequestStatus`
  - Params: `{ requestId: string }`
  - Live tracking of a specific request (status updates, map).
- **EmergencyScreen**
  - Route name: `Emergency`
  - Params: `{ alertId: string }`
  - Full‑screen urgent alert with red background, quick actions.
- **NotificationsScreen**
  - Route name: `Notifications`
  - Params: none
  - List of in‑app notifications, read/unread state.

## Navigation examples
```tsx
// Navigate to donor profile from a list item
const { goToDonorProfile } = useAppNavigation();
goToDonorProfile(item.id);

// Open map filtered to O+ blood group
goToMap('O+');
```
