import { apiClient } from '../api';

export interface CounterRecord {
  id: string;
  counterCode: string;
  name: string;
  description?: string;
  remark?: string;
  status: string;
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
