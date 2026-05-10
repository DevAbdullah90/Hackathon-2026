import apiClient from '../client/apiClient';
import { ApiResponse } from '../client/apiClient';

// Types (replace with real project types)
export interface BloodRequest {
  id: string;
  status: RequestStatus;
  createdAt: string;
  bloodGroup: string;
  urgency: 'critical' | 'urgent' | 'normal';
  // other fields as needed
}
export type RequestStatus = 'pending' | 'matched' | 'completed' | 'cancelled';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export interface CreateBloodRequestPayload {
  bloodGroup: BloodGroup;
  urgency: 'critical' | 'urgent' | 'normal';
  city: string;
  details?: string;
}
export interface Donor {}
export interface CreateRequestResponse {
  request: BloodRequest;
  matchedDonors: Donor[];
}
export interface UpdateStatusPayload {
  status: RequestStatus;
}

export const createBloodRequest = async (
  payload: CreateBloodRequestPayload
): Promise<CreateRequestResponse> => {
  const response = await apiClient.post<ApiResponse<CreateRequestResponse>>('/api/requests', payload);
  return response.data;
};

export const getActiveRequest = async (requestId: string): Promise<BloodRequest> => {
  const response = await apiClient.get<ApiResponse<BloodRequest>>(`/api/requests/${requestId}`);
  return response.data;
};

export const getUserRequests = async (): Promise<BloodRequest[]> => {
  const response = await apiClient.get<ApiResponse<BloodRequest[]>>('/api/requests/mine');
  return response.data;
};

export const cancelRequest = async (requestId: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/api/requests/${requestId}`);
};

export const updateRequestStatus = async (
  requestId: string,
  payload: UpdateStatusPayload
): Promise<BloodRequest> => {
  const response = await apiClient.patch<ApiResponse<BloodRequest>>(`/api/requests/${requestId}/status`, payload);
  return response.data;
};
