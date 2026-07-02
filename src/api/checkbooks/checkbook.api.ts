import { apiClient } from '../api';

export interface ICheckBook {
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

export interface ICreateCheckBook {
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

export interface IApproveRejectCheckBook {
  status: 'Approved' | 'Rejected';
  approvalRemarks?: string;
  fromDate?: string;
  toDate?: string;
}

export const checkbookApi = {
  create: async (data: ICreateCheckBook): Promise<ICheckBook> => {
    const res = await apiClient.post<ICheckBook>('/checkbooks/dispatch', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create checkbook dispatch');
    return res.data;
  },

  findAll: async (
    branchId?: string,
    status?: string,
    transactionType?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<ICheckBook[]> => {
    let url = '/checkbooks/dispatches';
    const params: string[] = [];
    if (branchId) params.push(`branchId=${encodeURIComponent(branchId)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (transactionType) params.push(`transactionType=${encodeURIComponent(transactionType)}`);
    if (fromDate) params.push(`fromDate=${encodeURIComponent(fromDate)}`);
    if (toDate) params.push(`toDate=${encodeURIComponent(toDate)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    const res = await apiClient.get<ICheckBook[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  approveOrReject: async (id: string, data: IApproveRejectCheckBook): Promise<ICheckBook> => {
    const res = await apiClient.put<ICheckBook>(`/checkbooks/dispatches/${id}/approve`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to approve/reject dispatch');
    return res.data;
  },

  bulkReview: async (reviews: Array<{ id: string; status: string; approvalRemarks?: string }>): Promise<ICheckBook[]> => {
    const res = await apiClient.put<ICheckBook[]>('/checkbooks/dispatches/bulk-review', { reviews });
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getNextNumber: async (branchId: string, dispatchDate: string): Promise<{ nextNumber: string }> => {
    const res = await apiClient.get<{ nextNumber: string }>(
      `/checkbooks/next-number?branchId=${encodeURIComponent(branchId)}&dispatchDate=${encodeURIComponent(dispatchDate)}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to fetch next number');
    return res.data;
  },

  getCashiers: async (branchId: string): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/checkbooks/cashiers?branchId=${encodeURIComponent(branchId)}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  saveAllocations: async (allocations: Array<{ checkBookId: string; bookNo: number; cashierId: string; remarks?: string }>): Promise<any[]> => {
    const res = await apiClient.post<any[]>('/checkbooks/allocations', { allocations });
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getAllocations: async (checkBookIds: string[]): Promise<Array<{ id: string; checkBookId: string; bookNo: number; cashierId: string; remarks?: string }>> => {
    const res = await apiClient.get<Array<{ id: string; checkBookId: string; bookNo: number; cashierId: string; remarks?: string }>>(
      `/checkbooks/allocations?checkBookIds=${encodeURIComponent(checkBookIds.join(','))}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
};
