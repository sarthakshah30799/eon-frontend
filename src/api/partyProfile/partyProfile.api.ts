import { apiClient } from '../api';
import type { PartyProfileType } from '@/modules/partyProfiles/constants';
import type {
  IPartyProfile,
  IPartyProfileListQuery,
  IPartyProfileListResponse,
  ICreatePartyProfile,
  IReviewPartyProfilePayload,
  IUpdatePartyProfile,
} from '@/modules/partyProfiles/types/partyProfileTypes';

const buildQueryString = (params?: IPartyProfileListQuery) => {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== undefined && item !== null && item !== '') {
          query.append(key, String(item));
        }
      });
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const partyProfileApi = {
  getPartyProfiles: async (
    params?: IPartyProfileListQuery,
    profileType?: PartyProfileType | PartyProfileType[]
  ): Promise<IPartyProfileListResponse> => {
    const typeParam = profileType ?? params?.type;
    const res = await apiClient.get<IPartyProfileListResponse>(`/party-profiles${buildQueryString({
      ...params,
      type: typeParam,
    })}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      return {
        data: [],
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalItems: 0,
        totalPages: 0,
      };
    }

    return {
      ...res.data,
      data: res.data.data || [],
    };
  },

  getPartyProfileById: async (
    id: string
  ): Promise<IPartyProfile | undefined> => {
    const res = await apiClient.get<IPartyProfile>(`/party-profiles/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createPartyProfile: async (
    values: ICreatePartyProfile
  ): Promise<IPartyProfile> => {
    const res = await apiClient.post<IPartyProfile>('/party-profiles', values);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create party profile');
    return res.data;
  },

  updatePartyProfile: async (
    id: string,
    values: IUpdatePartyProfile
  ): Promise<IPartyProfile | undefined> => {
    const res = await apiClient.put<IPartyProfile>(`/party-profiles/${id}`, values);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deletePartyProfile: async (
    id: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/party-profiles/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete party profile');
    return res.data;
  },

  getPartyProfileTypes: async (): Promise<{ value: string; label: string }[]> => {
    const res = await apiClient.get<{ value: string; label: string }[]>(
      '/party-profiles/types'
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getPendingReviewQueue: async (): Promise<IPartyProfile[]> => {
    const res = await apiClient.get<IPartyProfile[]>('/party-profiles/review-queue');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  reviewPartyProfile: async (
    id: string,
    values: IReviewPartyProfilePayload
  ): Promise<IPartyProfile> => {
    const res = await apiClient.post<IPartyProfile>(
      `/party-profiles/${id}/review`,
      values
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to review party profile');
    return res.data;
  },

  getAgentCommissionTemplate: async (id: string): Promise<string> => {
    const res = await apiClient.get<string>(
      `/party-profiles/${id}/commission/template`
    );
    if (res.error) throw new Error(res.error);
    return typeof res.data === 'string' ? res.data : '';
  },

  uploadAgentCommissionTemplate: async (
    id: string,
    file: File
  ): Promise<IPartyProfile> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.postFormData<IPartyProfile>(
      `/party-profiles/${id}/commission/upload`,
      formData
    );

    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to upload commission template');
    return res.data;
  },
};

export default partyProfileApi;
