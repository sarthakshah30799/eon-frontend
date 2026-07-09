import { apiClient } from '../api';
import type { IUserReference } from '../sharedTypes';

export interface IManualBook {
  id: string;
  dispatchDate: string;
  no: string;
  branchId: string;
  branchCode?: string;
  branchName?: string;
  transactionType: string;
  transactionTypeLabel?: string;
  bookNoFrom: number;
  bookNoTo: number;
  vouchersPerBook: number;
  mvNoFrom: number;
  mvNoTo: number;
  assignedTo: string | IUserReference;
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

export interface IManualBookAssignmentPayload {
  manualBookId: string;
  bookNo: number;
  userId: string;
  remarks?: string;
}

export interface IManualBookAllocation {
  id?: string;
  manualBookId: string;
  bookNo: number;
  cashierId: string;
  remarks?: string;
}

export interface IManualBookAssignmentResult {
  manualBookId: string;
  bookNo: number;
  userId: string;
}

export interface IManualBookDPMappingGroup {
  manualBookId: string;
  bookNo: number;
  transactionType: string;
  mvNoFrom: number;
  mvNoTo: number;
  qty: number;
  userId: string;
  assignedToUserName: string;
  pageIds: string[];
  remarks: string;
}

export interface IManualBookDPMappingActionResponse {
  success: boolean;
}

export const manualBillBookApi = {
  create: async (data: ICreateManualBook): Promise<IManualBook> => {
    const res = await apiClient.post<IManualBook>('/manual-bill-books/dispatch', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create manual book dispatch');
    return res.data;
  },

  findAll: async (
    branchId?: string,
    status?: string,
    transactionType?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<IManualBook[]> => {
    let url = '/manual-bill-books/dispatches';
    const params: string[] = [];
    if (branchId) params.push(`branchId=${encodeURIComponent(branchId)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (transactionType) params.push(`transactionType=${encodeURIComponent(transactionType)}`);
    if (fromDate) params.push(`fromDate=${encodeURIComponent(fromDate)}`);
    if (toDate) params.push(`toDate=${encodeURIComponent(toDate)}`);
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

  bulkReview: async (reviews: Array<{ id: string; status: string; approvalRemarks?: string }>): Promise<IManualBook[]> => {
    const res = await apiClient.put<IManualBook[]>('/manual-bill-books/dispatches/bulk-review', { reviews });
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getNextNumber: async (branchId: string, dispatchDate: string): Promise<{ nextNumber: string }> => {
    const res = await apiClient.get<{ nextNumber: string }>(
      `/manual-bill-books/next-number?branchId=${encodeURIComponent(branchId)}&dispatchDate=${encodeURIComponent(dispatchDate)}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to fetch next number');
    return res.data;
  },

  validateBookRange: async (params: {
    bookNoFrom: number;
    bookNoTo: number;
  }): Promise<{ valid: boolean; error?: string }> => {
    const res = await apiClient.get<{ valid: boolean; error?: string }>(
      `/manual-bill-books/validate-book-range?bookNoFrom=${params.bookNoFrom}&bookNoTo=${params.bookNoTo}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || { valid: true };
  },

  validatePageRange: async (params: {
    mvNoFrom: number;
    mvNoTo: number;
  }): Promise<{ valid: boolean; error?: string }> => {
    const res = await apiClient.get<{ valid: boolean; error?: string }>(
      `/manual-bill-books/validate-page-range?mvNoFrom=${params.mvNoFrom}&mvNoTo=${params.mvNoTo}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || { valid: true };
  },

  getAuthorizedUsers: async (): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      '/manual-bill-books/users'
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getBranchManagers: async (branchId: string): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/manual-bill-books/branch-managers?branchId=${encodeURIComponent(branchId)}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  saveAllocations: async (
    assignments: IManualBookAssignmentPayload[]
  ): Promise<IManualBookAssignmentResult[]> => {
    const res = await apiClient.post<IManualBookAssignmentResult[]>(
      '/manual-bill-books/assignments',
      { assignments }
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getAllocations: async (
    manualBookIds: string[]
  ): Promise<IManualBookAllocation[]> => {
    const res = await apiClient.get<IManualBookAllocation[]>(
      `/manual-bill-books/assignments?manualBookIds=${encodeURIComponent(
        manualBookIds.join(',')
      )}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getPagesByBookNo: async (
    manualBookId: string,
    bookNo: number
  ): Promise<IManualBookPageTracking[]> => {
    const res = await apiClient.get<IManualBookPageTracking[]>(
      `/manual-bill-books/${manualBookId}/books/${bookNo}/pages`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getSelectablePages: async (params?: {
    userId?: string;
  }): Promise<IManualBookPageTracking[]> => {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<IManualBookPageTracking[]>(
      `/manual-bill-books/pages/selectable${suffix}`
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
      '/manual-bill-books/pages/status',
      { pageNos, status, remarks }
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },

  transferPages: async (
    pageNos: number[],
    targetUserId: string
  ): Promise<{ success: boolean }> => {
    const res = await apiClient.post<{ success: boolean }>(
      '/manual-bill-books/pages/transfer',
      { pageNos, targetUserId }
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },

  returnPages: async (pageNos: number[]): Promise<{ success: boolean }> => {
    const res = await apiClient.post<{ success: boolean }>(
      '/manual-bill-books/pages/return',
      { pageNos }
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },

  searchPage: async (pageNo: number): Promise<IManualBookPageTracking> => {
    const res = await apiClient.get<IManualBookPageTracking>(
      `/manual-bill-books/pages/search?pageNo=${pageNo}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Page not found');
    return res.data;
  },

  searchDPMapping: async (params: {
    transactionType: string;
    bookNo: number;
    mvNoFrom: number;
    mvNoTo: number;
    actionType: 'MAP' | 'UNMAP';
  }): Promise<IManualBookDPMappingGroup[]> => {
    const res = await apiClient.get<IManualBookDPMappingGroup[]>(
      `/manual-bill-books/dp-mapping/search?transactionType=${encodeURIComponent(
        params.transactionType
      )}&bookNo=${params.bookNo}&mvNoFrom=${params.mvNoFrom}&mvNoTo=${
        params.mvNoTo
      }&actionType=${params.actionType}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  allocateToDP: async (data: {
    pageIds: string[];
    deliveryPersonId: string;
    remarks?: string;
  }): Promise<IManualBookDPMappingActionResponse> => {
    const res = await apiClient.post<IManualBookDPMappingActionResponse>(
      '/manual-bill-books/dp-mapping/allocate',
      data
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to allocate pages to delivery person');
    return res.data;
  },

  deallocateFromDP: async (data: {
    pageIds: string[];
    remarks?: string;
  }): Promise<IManualBookDPMappingActionResponse> => {
    const res = await apiClient.post<IManualBookDPMappingActionResponse>(
      '/manual-bill-books/dp-mapping/deallocate',
      data
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to deallocate pages from delivery person');
    return res.data;
  },

  getDeliveryPersons: async (): Promise<Array<{ id: string; name: string }>> => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      '/manual-bill-books/dp-mapping/delivery-persons'
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
};

export interface IManualBookPageTracking {
  id: string;
  manualBookId: string;
  userId: string;
  pageNo: number;
  isVoided: boolean;
  remarks?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  manualBook?: {
    id: string;
    no: string;
    bookNoFrom: number;
    bookNoTo: number;
    vouchersPerBook: number;
    mvNoFrom: number;
    mvNoTo: number;
    branchId: string;
    transactionType: string;
  } | null;
}
