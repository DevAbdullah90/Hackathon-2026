import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, NavigatorScreenParams } from '@react-navigation/native';

/**
 * Auth Stack params
 */
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTP: { phone: string };
};

/**
 * Tab params
 */
export type TabParamList = {
  Home: undefined;
  Map: { bloodGroup?: BloodGroup };
  Request: undefined;
  Profile: undefined;
};

/**
 * App Stack params (includes Tab navigator)
 */
export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  DonorProfile: { donorId: string };
  RequestStatus: { requestId: string };
  Emergency: { alertId: string };
  Notifications: undefined;
};

/**
 * Root Stack params (Auth or App)
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

/**
 * Navigation prop types for individual screens
 */
export type SplashScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Splash'
>;

export type OTPScreenRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

export type DonorProfileRouteProp = RouteProp<AppStackParamList, 'DonorProfile'>;

export type RequestStatusRouteProp = RouteProp<AppStackParamList, 'RequestStatus'>;

// Note: BloodGroup type should be defined elsewhere in the project and imported as needed.
