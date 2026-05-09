# BloodLink Event Types

## FCM Push Events

```typescript
export interface EmergencyFCM {
  type: 'emergency';
  bloodGroup: string; // e.g., 'A+', 'O-'
  hospital: string;
  city: string;
  urgency: 'critical' | 'high' | 'moderate';
}
```

```typescript
export interface DonorResponseFCM {
  type: 'donor_response';
  donorId: string;
  requestId: string;
  response: 'accept' | 'decline';
  eta?: number; // minutes, only for accept
}
```

```typescript
export interface RequestUpdateFCM {
  type: 'request_update';
  requestId: string;
  status: string; // matches RequestStatus enum
}
```

## Internal App Events

- **AppState**: `'active' | 'background' | 'inactive'`
- **Network**: `{ isConnected: boolean; type?: 'wifi' | 'cellular' | 'none' }`
- **Location**: `{ latitude: number; longitude: number; accuracy?: number }`

### Event ↔ Handler ↔ Store ↔ Screen Mapping

| Event | Handler | Store Updated | UI Reacts |
|-------|---------|--------------|-----------|
| `EmergencyFCM` | `handleEmergencyAlert` (emergencyAlertHandler) | `notificationStore`, `globalStore` | EmergencyScreen (red theme) |
| `DonorResponseFCM` | `handleDonorResponse` (donorResponseHandler) | `bloodRequestStore`, `notificationStore` | RequestStatusScreen |
| `RequestUpdateFCM` | Inline in `useNotificationEvents` | `bloodRequestStore` | RequestStatusScreen |
| `AppState` change | `useAppStateEvents` hook | N/A (triggers queries) | Any screen showing donors |
| `Network` change | `useNetworkEvents` hook | `globalStore.online` | Offline banner |
| `Location` change | `useLocationEvents` hook | `mapStore` (user location, region) | MapScreen |
