import { apiClient } from '../api';

export interface DashboardStats {
  todayVolume: string;
  yesterdayVolume: string;
  todayTransactionCount: number;
  yesterdayTransactionCount: number;
  pendingApprovals: number;
  pendingPartyProfileReviews: number;
  activeAlerts: number;
}

export interface VolumeByCurrency {
  currencyId: string;
  currencyCode: string;
  todayVolume: string;
  yesterdayVolume: string;
  changePercent: string;
  products: Array<{
    productId: string;
    productCode: string;
    todayVolume: string;
    yesterdayVolume: string;
    changePercent: string;
  }>;
}

export interface VolumeDataPoint {
  date: string;
  saleVolume: string;
  purchaseVolume: string;
}

export interface RecentTransaction {
  id: string;
  number: string;
  partyName: string;
  currencyCode: string;
  productCode: string;
  transactionType: string;
  fcyAmount: string;
  lcyAmount: string;
  status: string;
  createdAt: string;
}

export interface PendingApproval {
  id: string;
  code: string;
  name: string;
  type: string;
  createdAt: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    if (res.error) throw new Error(res.error);
    return res.data ?? {
      todayVolume: '0',
      yesterdayVolume: '0',
      todayTransactionCount: 0,
      yesterdayTransactionCount: 0,
      pendingApprovals: 0,
      pendingPartyProfileReviews: 0,
      activeAlerts: 0,
    };
  },

  getVolumeByCurrency: async (): Promise<VolumeByCurrency[]> => {
    const res = await apiClient.get<VolumeByCurrency[]>('/dashboard/volume-by-currency');
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  getVolumeChart: async (days?: number): Promise<VolumeDataPoint[]> => {
    const query = days ? `?days=${days}` : '';
    const res = await apiClient.get<VolumeDataPoint[]>(`/dashboard/volume-chart${query}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  getRecentTransactions: async (limit?: number): Promise<RecentTransaction[]> => {
    const query = limit ? `?limit=${limit}` : '';
    const res = await apiClient.get<RecentTransaction[]>(`/dashboard/recent-transactions${query}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  getPendingApprovals: async (limit?: number): Promise<PendingApproval[]> => {
    const query = limit ? `?limit=${limit}` : '';
    const res = await apiClient.get<PendingApproval[]>(`/dashboard/pending-approvals${query}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },
};
