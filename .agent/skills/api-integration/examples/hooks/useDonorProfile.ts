import { useQuery } from '@tanstack/react-query';
import { getDonorProfile, Donor } from '../api/donorApi';
import { ApiError } from '../../errors/ApiError'; // placeholder error type

export interface UseDonorProfileReturn {
  donor: Donor | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
}

export const useDonorProfile = (donorId: string): UseDonorProfileReturn => {
  const { data, error, isLoading, isError } = useQuery<Donor, ApiError>({
    queryKey: ['donor', donorId],
    queryFn: () => getDonorProfile(donorId),
    staleTime: 300_000,
    enabled: !!donorId,
  });

  return {
    donor: data ?? null,
    isLoading,
    isError,
    error: error ?? null,
  };
};
