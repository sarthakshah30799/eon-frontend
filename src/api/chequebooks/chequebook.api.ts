import { apiClient } from '../api';

export interface IChequeBook {
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

export interface ICreateChequeBook {
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

export interface IApproveRejectChequeBook {
  status: 'Approved' | 'Rejected';
  approvalRemarks?: string;
  fromDate?: string;
  toDate?: string;
}

export interface IChequeBookAllocationPayload {
  checkBookId: string;
  bookNo: number;
  cashierId: string;
  remarks?: string;
}

export interface IChequeBookAllocation {
  id: string;
  checkBookId: string;
  bookNo: number;
  cashierId: string;
  remarks?: string;
}

export const chequebookApi = {
  create: async (data: ICreateChequeBook): Promise<IChequeBook> => {
    const res = await apiClient.post<IChequeBook>('/chequebooks/dispatch', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create chequebook dispatch');
    return res.data;
  },

  findAll: async (
    branchId?: string,
    status?: string,
    transactionType?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<IChequeBook[]> => {
    let url = '/chequebooks/dispatches';
    const params: string[] = [];
    if (branchId) params.push(`branchId=${encodeURIComponent(branchId)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (transactionType) params.push(`transactionType=${encodeURIComponent(transactionType)}`);
    if (fromDate) params.push(`fromDate=${encodeURIComponent(fromDate)}`);
    if (toDate) params.push(`toDate=${encodeURIComponent(toDate)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    const res = await apiClient.get<IChequeBook[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  approveOrReject: async (id: string, data: IApproveRejectChequeBook): Promise<IChequeBook> => {
    const res = await apiClient.put<IChequeBook>(`/chequebooks/dispatches/${id}/approve`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to approve/reject dispatch');
    return res.data;
  },

  bulkReview: async (reviews: Array<{ id: string; status: string; approvalRemarks?: string }>): Promise<IChequeBook[]> => {
    const res = await apiClient.put<IChequeBook[]>('/chequebooks/dispatches/bulk-review', { reviews });
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getNextNumber: async (branchId: string, dispatchDate: string): Promise<{ nextNumber: string }> => {
    const res = await apiClient.get<{ nextNumber: string }>(
      `/chequebooks/next-number?branchId=${encodeURIComponent(branchId)}&dispatchDate=${encodeURIComponent(dispatchDate)}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to fetch next number');
    return res.data;
  },

  getCashiers: async (branchId: string): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/chequebooks/cashiers?branchId=${encodeURIComponent(branchId)}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  saveAllocations: async (
    allocations: IChequeBookAllocationPayload[]
  ): Promise<IChequeBookAllocation[]> => {
    const res = await apiClient.post<IChequeBookAllocation[]>(
      '/chequebooks/allocations',
      { allocations }
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getAllocations: async (
    checkBookIds: string[]
  ): Promise<IChequeBookAllocation[]> => {
    const res = await apiClient.get<IChequeBookAllocation[]>(
      `/chequebooks/allocations?checkBookIds=${encodeURIComponent(
        checkBookIds.join(',')
      )}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
};
