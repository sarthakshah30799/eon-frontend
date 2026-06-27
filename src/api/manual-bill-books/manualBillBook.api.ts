import { apiClient } from '../api';

export interface IManualBook {
  id: string;
  dispatchDate: string;
  no: string;
  branchId: string;
  branchCode?: string;
  branchName?: string;
  transactionType: string;
  bookNoFrom: number;
  bookNoTo: number;
  vouchersPerBook: number;
  mvNoFrom: number;
  mvNoTo: number;
  assignedTo: string;
  remarks?: string;
  status: string; // 'Pending' | 'Approved' | 'Rejected'
  fromDate?: string;
  toDate?: string;
  approvalRemarks?: string;
  createdAt: string;
}

export interface ICreateManualBook {
  dispatchDate: string;
  branchId: string;
  transactionType: string;
  bookNoFrom: number;
  bookNoTo: number;
  vouchersPerBook: number;
  mvNoFrom: number;
  assignedTo: string;
  remarks?: string;
}

export interface IApproveRejectManualBook {
  status: 'Approved' | 'Rejected';
  approvalRemarks?: string;
  fromDate?: string;
  toDate?: string;
}

export const manualBillBookApi = {
  create: async (data: ICreateManualBook): Promise<IManualBook> => {
    const res = await apiClient.post<IManualBook>('/manual-bill-books/dispatch', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create manual book dispatch');
    return res.data;
  },

  findAll: async (branchId?: string, status?: string): Promise<IManualBook[]> => {
    let url = '/manual-bill-books/dispatches';
    const params: string[] = [];
    if (branchId) params.push(`branchId=${branchId}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    const res = await apiClient.get<IManualBook[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  approveOrReject: async (id: string, data: IApproveRejectManualBook): Promise<IManualBook> => {
    const res = await apiClient.put<IManualBook>(`/manual-bill-books/dispatches/${id}/approve`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to approve/reject dispatch');
    return res.data;
  },

  getNextNumber: async (branchId: string, dispatchDate: string): Promise<{ nextNumber: string }> => {
    const res = await apiClient.get<{ nextNumber: string }>(
      `/manual-bill-books/next-number?branchId=${encodeURIComponent(branchId)}&dispatchDate=${encodeURIComponent(dispatchDate)}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to fetch next number');
    return res.data;
  },
};
