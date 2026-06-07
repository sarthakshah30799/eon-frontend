import { apiClient } from '../api';
import type {
  IAccountProfile,
  IAccountProfileListQuery,
  IAccountProfileListResponse,
  ICreateAccountProfile,
} from '@/modules/accountProfile/types/accountProfileTypes';

const buildQueryString = (params?: IAccountProfileListQuery) => {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const accountProfileApi = {
  getAccountProfiles: async (
    params?: IAccountProfileListQuery
  ): Promise<IAccountProfileListResponse> => {
    const res = await apiClient.get<IAccountProfileListResponse>(
      `/account-profiles${buildQueryString(params)}`
    );
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

  getAccountProfileById: async (
    id: string
  ): Promise<IAccountProfile | undefined> => {
    const res = await apiClient.get<IAccountProfile>(`/account-profiles/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createAccountProfile: async (
    values: ICreateAccountProfile
  ): Promise<IAccountProfile> => {
    const res = await apiClient.post<IAccountProfile>('/account-profiles', values);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create account profile');
    return res.data;
  },

  updateAccountProfile: async (
    id: string,
    values: ICreateAccountProfile
  ): Promise<IAccountProfile | undefined> => {
    const res = await apiClient.put<IAccountProfile>(`/account-profiles/${id}`, values);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteAccountProfile: async (
    id: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/account-profiles/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete account profile');
    return res.data;
  },
};
export default accountProfileApi;
