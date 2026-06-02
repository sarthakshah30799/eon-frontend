import { apiClient } from '../api';

export interface CounterRecord {
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

export const counterApi = {
  getCounters: async (): Promise<CounterRecord[]> => {
    const res = await apiClient.get<CounterRecord[]>('/counters');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
  getCounterById: async (id: string): Promise<CounterRecord> => {
    const res = await apiClient.get<CounterRecord>(`/counters/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Counter not found');
    return res.data;
  },
};
