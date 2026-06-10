import { apiClient } from '../api';
import type {
  ICorporateClient,
  ICorporateClientListQuery,
  ICorporateClientListResponse,
  ICreateCorporateClient,
  IUpdateCorporateClient,
} from '@/modules/corporateClient/types/corporateClientTypes';

const buildQueryString = (params?: ICorporateClientListQuery) => {
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

export const corporateClientApi = {
  getCorporateClients: async (
    params?: ICorporateClientListQuery
  ): Promise<ICorporateClientListResponse> => {
    const res = await apiClient.get<ICorporateClientListResponse>(
      `/corporate-clients${buildQueryString(params)}`
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

  getCorporateClientById: async (
    id: string
  ): Promise<ICorporateClient | undefined> => {
    const res = await apiClient.get<ICorporateClient>(`/corporate-clients/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createCorporateClient: async (
    values: ICreateCorporateClient
  ): Promise<ICorporateClient> => {
    const res = await apiClient.post<ICorporateClient>('/corporate-clients', values);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create corporate client');
    return res.data;
  },

  updateCorporateClient: async (
    id: string,
    values: IUpdateCorporateClient
  ): Promise<ICorporateClient | undefined> => {
    const res = await apiClient.put<ICorporateClient>(`/corporate-clients/${id}`, values);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteCorporateClient: async (
    id: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/corporate-clients/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete corporate client');
    return res.data;
  },
};

export default corporateClientApi;
