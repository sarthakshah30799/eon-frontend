import { apiClient } from '../api';
import type {
  ICreateCounterProfile,
  ICounterProfile,
} from '@/modules/counterProfile/types';

interface BackendCounter {
  id: string;
  counterNo: number;
  counterName: string;
  isActive: boolean;
  isRetailCnt: boolean;
  isBulkCnt: boolean;
  isCombineCnt: boolean;
  branchId?: string;
  branchCode?: string;
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontend = (counter: BackendCounter): ICounterProfile => {
  return {
    id: counter.id,
    counterNo: String(counter.counterNo),
    counterName: counter.counterName,
    isActive: counter.isActive,
    isRetailCnt: counter.isRetailCnt,
    isBulkCnt: counter.isBulkCnt,
    isCombineCnt: counter.isCombineCnt,
    createdAt: counter.createdAt,
    updatedAt: counter.updatedAt,
  };
};

const mapFrontendToBackend = (values: ICreateCounterProfile) => {
  return {
    counterNo: parseInt(values.counterNo, 10) || 1,
    counterName: values.counterName,
    isActive: values.isActive,
    isRetailCnt: values.isRetailCnt,
    isBulkCnt: values.isBulkCnt,
    isCombineCnt: values.isCombineCnt,
  };
};

export const counterProfileApi = {
  getCounterProfiles: async (): Promise<ICounterProfile[]> => {
    const res = await apiClient.get<BackendCounter[]>('/counters');
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
