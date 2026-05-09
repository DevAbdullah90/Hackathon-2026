import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBloodRequest,
  getActiveRequest,
  getUserRequests,
  cancelRequest,
  updateRequestStatus,
  CreateBloodRequestPayload,
  CreateRequestResponse,
  BloodRequest,
  UpdateStatusPayload,
} from '../api/bloodRequestApi';
import { bloodRequestStore } from '../../stores/bloodRequestStore'; // placeholder store
import { notificationStore } from '../../stores/notificationStore'; // placeholder
import { navigation } from '../../navigation'; // placeholder navigation helper
import { ApiError } from '../../errors/ApiError'; // placeholder error type

// Hook for creating a blood request
export const useCreateBloodRequest = () =>
  useMutation<CreateRequestResponse, ApiError, CreateBloodRequestPayload>({
    mutationFn: createBloodRequest,
    onSuccess: (data) => {
      bloodRequestStore.setActiveRequest(data.request);
      bloodRequestStore.setMatchedDonors(data.matchedDonors);
      notificationStore.addNotification({
        type: 'success',
        message: 'Blood request created',
      });
      navigation.navigate('RequestStatus', { requestId: data.request.id });
    },
    onError: (error: ApiError) => {
      // Show error to user – UI layer will read error.userMessage if present
      notificationStore.addNotification({
        type: 'error',
        message: error.userMessage ?? 'Failed to create request',
      });
    },
  });

// Hook for fetching an active request
export const useActiveRequest = (requestId: string) => {
  return useQuery<BloodRequest, ApiError>({
    queryKey: ['request', requestId],
    queryFn: () => getActiveRequest(requestId),
    refetchInterval: 10_000,
    enabled: !!requestId,
    onSuccess: (data) => {
      bloodRequestStore.setRequestStatus(data);
    },
  });
};

// Hook for fetching user's requests list
export const useUserRequests = () => {
  return useQuery<BloodRequest[], ApiError>({
    queryKey: ['requests', 'mine'],
    queryFn: getUserRequests,
    staleTime: 60_000,
  });
};
