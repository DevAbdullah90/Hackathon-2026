import { useQuery } from '@tanstack/react-query';
import { getNearbyDonors, NearbyDonorsResponse, BloodGroup, NearbyDonorsParams } from '../api/donorApi';
import { donorStore } from '../../stores/donorStore'; // assume store exists
import { ApiError } from '../../errors/ApiError'; // placeholder error type

export interface UseNearbyDonorsReturn {
  donors: Donor[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
  isFetching: boolean;
}

export const useNearbyDonors = (
  bloodGroup: BloodGroup,
  city: string,
  radiusKm: number = 5
): UseNearbyDonorsReturn => {
  const { data, error, isLoading, isError, refetch, isFetching } = useQuery<
    NearbyDonorsResponse,
    ApiError
  >({
    queryKey: ['donors', 'nearby', bloodGroup, city, radiusKm],
    queryFn: () =>
      getNearbyDonors({ bloodGroup, city, radiusKm } as NearbyDonorsParams),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: !!bloodGroup && !!city,
  });

  // Update donor store when data arrives
  if (data) {
    donorStore.setDonors(data.donors);
  }

  return {
    donors: data?.donors ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
    isFetching,
  };
};
