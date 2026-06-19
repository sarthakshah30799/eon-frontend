import { apiClient } from '../api';
import type {
  IFfmcClient,
  IFfmcClientListQuery,
  IFfmcClientListResponse,
  ICreateFfmcClient,
  IUpdateFfmcClient,
} from '@/modules/ffmcClient/types/ffmcClientTypes';

const buildQueryString = (params?: IFfmcClientListQuery) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const ffmcClientApi = {
  getFfmcClients: async (params?: IFfmcClientListQuery): Promise<IFfmcClientListResponse> => {
    const res = await apiClient.get<IFfmcClientListResponse>(`/ffmc-clients${buildQueryString(params)}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      return { data: [], page: params?.page ?? 1, limit: params?.limit ?? 10, totalItems: 0, totalPages: 0 };
    }
    return { ...res.data, data: res.data.data || [] };
  },

  getFfmcClientById: async (id: string): Promise<IFfmcClient | undefined> => {
    const res = await apiClient.get<IFfmcClient>(`/ffmc-clients/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createFfmcClient: async (values: ICreateFfmcClient): Promise<IFfmcClient> => {
    const res = await apiClient.post<IFfmcClient>('/ffmc-clients', values);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create FFMC client');
    return res.data;
  },

  updateFfmcClient: async (id: string, values: IUpdateFfmcClient): Promise<IFfmcClient | undefined> => {
    const res = await apiClient.put<IFfmcClient>(`/ffmc-clients/${id}`, values);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteFfmcClient: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/ffmc-clients/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete FFMC client');
    return res.data;
  },
};

export default ffmcClientApi;
