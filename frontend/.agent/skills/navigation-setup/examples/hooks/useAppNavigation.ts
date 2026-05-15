import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';

/**
 * Typed navigation helper exposing convenient functions for each screen.
 */
export interface UseAppNavigationReturn {
  goToHome: () => void;
  goToMap: (bloodGroup?: BloodGroup) => void;
  goToRequest: () => void;
  goToProfile: () => void;
  goToDonorProfile: (donorId: string) => void;
  goToRequestStatus: (requestId: string) => void;
  goToEmergency: (alertId: string) => void;
  goToNotifications: () => void;
  goToLogin: () => void;
  goBack: () => void;
}

export const useAppNavigation = (): UseAppNavigationReturn => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return {
    goToHome: () => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Home' } }),
    goToMap: (bloodGroup) =>
      navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Map', params: { bloodGroup } } }),
    goToRequest: () => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Request' } }),
    goToProfile: () => navigation.navigate('App', { screen: 'Tabs', params: { screen: 'Profile' } }),
    goToDonorProfile: (donorId) => navigation.navigate('DonorProfile', { donorId }),
    goToRequestStatus: (requestId) => navigation.navigate('RequestStatus', { requestId }),
    goToEmergency: (alertId) => navigation.navigate('Emergency', { alertId }),
    goToNotifications: () => navigation.navigate('Notifications'),
    goToLogin: () => navigation.navigate('Auth', { screen: 'Login' }),
    goBack: () => navigation.goBack(),
  };
};
