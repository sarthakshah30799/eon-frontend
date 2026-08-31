import { apiClient } from '../api';
import type {
  ICreateCounterProfile,
  ICounterProfile,
  ICounterProfileListQuery,
} from '@/modules/counterProfile/types';
import type { IPaginatedResponse } from '@/types/pagination';
import { buildQueryString, fetchAllMatching, normalizePaginatedResponse } from '@/utils';

interface BackendCounter {
  id: string;
  counterNo: number;
  name: string;
  isActive: boolean;
  isRetail: boolean;
  isBulk: boolean;
  isCombine: boolean;
  branchIds?: string[];
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontend = (counter: BackendCounter): ICounterProfile => {
  return {
    id: counter.id,
    counterNo: String(counter.counterNo),
    name: counter.name,
    isActive: counter.isActive,
    isRetail: counter.isRetail,
    isBulk: counter.isBulk,
    isCombine: counter.isCombine,
    branchIds: counter.branchIds || [],
    createdAt: counter.createdAt,
    updatedAt: counter.updatedAt,
  };
};

const mapFrontendToBackend = (values: ICreateCounterProfile) => {
  return {
    counterNo: parseInt(values.counterNo, 10) || 1,
    name: values.name,
    isActive: values.isActive,
    isRetail: values.isRetail,
    isBulk: values.isBulk,
    isCombine: values.isCombine,
  };
};

export const counterProfileApi = {
  getCounterProfiles: async (
    options?: ICounterProfileListQuery
  ): Promise<IPaginatedResponse<ICounterProfile>> => {
    const endpoint = `/counters${buildQueryString(options)}`;
    const res =
      await apiClient.get<IPaginatedResponse<BackendCounter>>(endpoint);
    if (res.error) throw new Error(res.error);
    const payload = normalizePaginatedResponse(res.data, options?.limit, options?.offset);
    return {
      ...payload,
      data: payload.data.map(mapBackendToFrontend),
    };
  },

  getAllCounterProfiles: async (
    options?: Omit<ICounterProfileListQuery, 'limit' | 'offset'>
  ): Promise<ICounterProfile[]> =>
    fetchAllMatching(pagination =>
      counterProfileApi.getCounterProfiles({ ...options, ...pagination })
    ),

  getCounterProfileById: async (
    id: string
  ): Promise<ICounterProfile | undefined> => {
    const res = await apiClient.get<BackendCounter>(`/counters/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createCounterProfile: async (
    values: ICreateCounterProfile
  ): Promise<ICounterProfile> => {
    const backendData = mapFrontendToBackend(values);
    const res = await apiClient.post<BackendCounter>('/counters', backendData);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create counter');
    return mapBackendToFrontend(res.data);
  },

  updateCounterProfile: async (
    id: string,
    values: ICreateCounterProfile
  ): Promise<ICounterProfile | undefined> => {
    const backendData = mapFrontendToBackend(values);
    const res = await apiClient.put<BackendCounter>(
      `/counters/${id}`,
      backendData
    );
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  updateCounterProfileStatus: async (
    id: string,
    isActive: boolean
  ): Promise<ICounterProfile | undefined> => {
    const res = await apiClient.put<BackendCounter>(`/counters/${id}`, {
      isActive,
    });
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  deleteCounterProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/counters/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
