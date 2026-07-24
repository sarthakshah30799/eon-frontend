import { apiClient } from '../api';
import type {
  IPassengerOtherDocumentVerificationRequest,
  IPassengerPanVerificationRequest,
  IPassengerPassportVerificationRequest,
  IPassengerAmlVerificationResponse,
} from '@/modules/passengers/types/passengerTypes';

export const passengersApi = {
  getOtherDocumentTypes: async (): Promise<Array<{ value: string; label: string }>> => {
    const res = await apiClient.get<Array<{ value: string; label: string }>>(
      '/passengers/other-document-types'
    );

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data ?? [];
  },

  verifyPan: async (
    payload: IPassengerPanVerificationRequest
  ): Promise<IPassengerAmlVerificationResponse> => {
    const res = await apiClient.post<IPassengerAmlVerificationResponse>(
      '/passengers/verify-pan',
      payload
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to verify passenger PAN details');
    }

    return res.data;
  },

  verifyPassport: async (
    payload: IPassengerPassportVerificationRequest
  ): Promise<IPassengerAmlVerificationResponse> => {
    const res = await apiClient.post<IPassengerAmlVerificationResponse>(
      '/passengers/verify-passport',
      payload
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to verify passenger passport details');
    }

    return res.data;
  },

  verifyOtherDocument: async (
    payload: IPassengerOtherDocumentVerificationRequest
  ): Promise<IPassengerAmlVerificationResponse> => {
    const res = await apiClient.post<IPassengerAmlVerificationResponse>(
      '/passengers/verify-other-document',
      payload
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to verify passenger AML details');
    }

    return res.data;
  },
};

export default passengersApi;
