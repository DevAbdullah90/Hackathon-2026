import apiClient from '../client/apiClient';
import { ApiResponse, ApiErrorResponse } from '../client/apiClient'; // types exported

// Types (simplified placeholders – replace with actual project types)
export interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: { city: string; lat: number; lng: number };
  isAvailable: boolean;
}
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export interface DonorAvailabilityUpdate {
  isAvailable: boolean;
}
export interface DonorRespondPayload {
  requestId: string;
  response: 'accept' | 'decline';
}
export interface BloodRequest {}

export interface NearbyDonorsParams {
  bloodGroup: BloodGroup;
  city: string;
  radiusKm: number;
}
export interface NearbyDonorsResponse {
  donors: Donor[];
  total: number;
}

export const getNearbyDonors = async (params: NearbyDonorsParams): Promise<NearbyDonorsResponse> => {
  // Pakistan city context: donors may be dispersed; radius adjusts accordingly
  const response = await apiClient.get<ApiResponse<NearbyDonorsResponse>>('/api/donors/nearby', {
    params: {
      bloodGroup: params.bloodGroup,
      city: params.city,
      radius: params.radiusKm,
    },
  });
  return response.data;
};

export const getDonorProfile = async (donorId: string): Promise<Donor> => {
  const response = await apiClient.get<ApiResponse<Donor>>(`/api/donors/${donorId}`);
  return response.data;
};

export const updateDonorAvailability = async (
  donorId: string,
  update: DonorAvailabilityUpdate
): Promise<void> => {
  await apiClient.patch<ApiResponse<void>>(`/api/donors/${donorId}/availability`, update);
};

export const respondToRequest = async (
  donorId: string,
  payload: DonorRespondPayload
): Promise<void> => {
  await apiClient.post<ApiResponse<void>>(`/api/donors/${donorId}/respond`, payload);
};

export const getDonorHistory = async (donorId: string): Promise<BloodRequest[]> => {
  const response = await apiClient.get<ApiResponse<BloodRequest[]>>(`/api/donors/${donorId}/history`);
  return response.data;
};
