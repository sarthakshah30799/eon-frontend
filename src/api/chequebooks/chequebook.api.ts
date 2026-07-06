import { apiClient } from '../api';

export interface IChequeBook {
  id: string;
  dispatchDate: string;
  no: string;
  branchId: string;
  branchCode?: string;
  branchName?: string;
  bankAccountCode: string;
  bankAccountCodeLabel?: string;
  bankAccountCodeName?: string;
  bookNoFrom: number;
  bookNoTo: number;
  vouchersPerBook: number;
  mvNoFrom: number;
  mvNoTo: number;
  assignedTo: string;
  assignedToName?: string;
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
  bankAccountCode: string;
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
  userId: string;
  remarks?: string;
}

export interface IChequeBookAllocation {
  id?: string;
  checkBookId: string;
  bookNo: number;
  cashierId: string;
  remarks?: string;
}

export interface IChequeBookCashierReturnGroup {
  checkBookId: string;
  bookNo: number;
  bankAccountCode: string;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  pageIds: string[];
  pageNos: number[];
  remarks: string;
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
    bankAccountCode?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<IChequeBook[]> => {
    let url = '/chequebooks/dispatches';
    const params: string[] = [];
    if (branchId) params.push(`branchId=${encodeURIComponent(branchId)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (bankAccountCode) params.push(`bankAccountCode=${encodeURIComponent(bankAccountCode)}`);
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

  getAuthorizedUsers: async (branchId: string): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/chequebooks/users?branchId=${encodeURIComponent(branchId)}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getBranchManagers: async (branchId: string): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/chequebooks/branch-managers?branchId=${encodeURIComponent(branchId)}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  saveAllocations: async (
    assignments: IChequeBookAllocationPayload[]
  ): Promise<IChequeBookAllocation[]> => {
    const res = await apiClient.post<IChequeBookAllocation[]>(
      '/chequebooks/assignments',
      { assignments }
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getAllocations: async (
    checkBookIds: string[]
  ): Promise<IChequeBookAllocation[]> => {
    const res = await apiClient.get<IChequeBookAllocation[]>(
      `/chequebooks/assignments?checkBookIds=${encodeURIComponent(
        checkBookIds.join(',')
      )}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getPagesByBookNo: async (
    checkBookId: string,
    bookNo: number
  ): Promise<IChequeBookPageTracking[]> => {
    const res = await apiClient.get<IChequeBookPageTracking[]>(
      `/chequebooks/${checkBookId}/books/${bookNo}/pages`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getSelectablePages: async (params: {
    branchId?: string;
    accountId?: string;
    userId?: string;
  }): Promise<IChequeBookPageTracking[]> => {
    const query = new URLSearchParams();
    if (params.branchId) query.set('branchId', params.branchId);
    if (params.accountId) query.set('accountId', params.accountId);
    if (params.userId) query.set('userId', params.userId);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<IChequeBookPageTracking[]>(
      `/chequebooks/pages/selectable${suffix}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  updatePagesStatus: async (
    pageNos: number[],
    status: 'VOID',
    remarks?: string
  ): Promise<{ success: boolean }> => {
    const res = await apiClient.put<{ success: boolean }>(
      '/chequebooks/pages/status',
      { pageNos, status, remarks }
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },

  returnPages: async (pageNos: number[]): Promise<{ success: boolean }> => {
    const res = await apiClient.post<{ success: boolean }>(
      '/chequebooks/pages/return',
      { pageNos }
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },

  searchPage: async (pageNo: number): Promise<IChequeBookPageTracking> => {
    const res = await apiClient.get<IChequeBookPageTracking>(
      `/chequebooks/pages/search?pageNo=${pageNo}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error(`Page number ${pageNo} not found`);
    return res.data;
  },

  searchCashierReturn: async (params: {
    bankAccountCode: string;
    bookNo: number;
    chequeNoFrom: number;
    chequeNoTo: number;
  }): Promise<IChequeBookCashierReturnGroup[]> => {
    const res = await apiClient.get<IChequeBookCashierReturnGroup[]>(
      `/chequebooks/cashier-return/search?bankAccountCode=${encodeURIComponent(
        params.bankAccountCode
      )}&bookNo=${params.bookNo}&chequeNoFrom=${params.chequeNoFrom}&chequeNoTo=${
        params.chequeNoTo
      }`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
};

export interface IChequeBookPageTracking {
  id: string;
  checkBookId: string;
  userId: string;
  pageNo: number;
  isVoided: boolean;
  remarks?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  checkBook?: {
    id: string;
    no: string;
    bookNoFrom: number;
    bookNoTo: number;
    vouchersPerBook: number;
    mvNoFrom: number;
    mvNoTo: number;
    branchId: string;
    bankAccountCode: string | null;
  } | null;
}
