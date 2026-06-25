import { apiClient } from '../api';
import type {
  ICreateCounterProfile,
  ICounterProfile,
} from '@/modules/counterProfile/types';

interface BackendCounter {
  id: string;
  counterNo: number;
  name: string;
  isActive: boolean;
  isRetail: boolean;
  isBulk: boolean;
  isCombine: boolean;
  branchId?: string;
  branchCode?: string;
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
  getCounterProfiles: async (options?: {
    activeOnly?: boolean;
  }): Promise<ICounterProfile[]> => {
    const endpoint =
      options?.activeOnly === false ? '/counters?activeOnly=false' : '/counters';
    const res = await apiClient.get<BackendCounter[]>(endpoint);
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },

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
    const res = await apiClient.put<BackendCounter>(`/counters/${id}`, backendData);
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
