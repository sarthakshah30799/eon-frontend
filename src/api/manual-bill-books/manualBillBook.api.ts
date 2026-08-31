import { apiClient } from '../api';
import type { IUserReference } from '../sharedTypes';
import type {
  IPaginatedResponse,
  IOffsetPaginationParams,
} from '@/types/pagination';
import { ManualBillBookStatusEnum } from '@/modules/manual-bill-books/types';
import { buildQueryString } from '@/utils';
import {
  fetchAllMatching,
  normalizePaginatedResponse,
} from '@/utils/paginatedList';

export type ManualBookStatus =
  (typeof ManualBillBookStatusEnum)[keyof typeof ManualBillBookStatusEnum];

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
  status: ManualBookStatus;
  approvalRemarks?: string;
  createdAt: string;
}

export interface ICreateManualBook {
  dispatchDate: string;
  transactionType: string;
  bookNoFrom: number;
  bookNoTo: number;
  vouchersPerBook: number;
  mvNoFrom: number;
  assignedTo: string;
  remarks?: string;
}

export interface IApproveRejectManualBook {
  status: Exclude<ManualBookStatus, typeof ManualBillBookStatusEnum.PENDING>;
  approvalRemarks?: string;
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
  cashierName?: string | null;
  assignedBy?: string | null;
  assignedByName?: string | null;
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

export interface IManualBillBookListQuery extends IOffsetPaginationParams {
  branchId?: string;
  status?: string;
  transactionType?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  bookNoFrom?: number;
  bookNoTo?: number;
}

export interface IManualBookSelectablePagesQuery extends IOffsetPaginationParams {
  userId?: string;
  transactionType?: string;
}

export type IManualBillBookListResponse = IPaginatedResponse<IManualBook>;

export const manualBillBookApi = {
  create: async (data: ICreateManualBook): Promise<IManualBook> => {
    const res = await apiClient.post<IManualBook>(
      '/manual-bill-books/dispatch',
      data
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create manual book dispatch');
    return res.data;
  },

  findById: async (id: string): Promise<IManualBook> => {
    const res = await apiClient.get<IManualBook>(
      `/manual-bill-books/dispatches/${id}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Dispatch not found');
    return res.data;
  },

  findAll: async (
    params?: IManualBillBookListQuery
  ): Promise<IManualBillBookListResponse> => {
    const res = await apiClient.get<IManualBillBookListResponse>(
      `/manual-bill-books/dispatches${buildQueryString(params)}`
    );
    if (res.error) throw new Error(res.error);
    return normalizePaginatedResponse(res.data, params?.limit, params?.offset);
  },

  findAllMatching: async (
    params?: Omit<IManualBillBookListQuery, 'limit' | 'offset'>
  ): Promise<IManualBook[]> =>
    fetchAllMatching(pagination =>
      manualBillBookApi.findAll({ ...params, ...pagination })
    ),

  approveOrReject: async (
    id: string,
    data: IApproveRejectManualBook
  ): Promise<IManualBook> => {
    const res = await apiClient.put<IManualBook>(
      `/manual-bill-books/dispatches/${id}/approve`,
      data
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to approve/reject dispatch');
    return res.data;
  },

  reassignDispatch: async (
    id: string,
    data: {
      assignedTo: string;
      remarks?: string;
      dispatchDate?: string;
      transactionType?: string;
      bookNoFrom?: number;
      bookNoTo?: number;
      vouchersPerBook?: number;
      mvNoFrom?: number;
      mvNoTo?: number;
    }
  ): Promise<IManualBook> => {
    const res = await apiClient.put<IManualBook>(
      `/manual-bill-books/dispatches/${id}/reassign`,
      data
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to reassign dispatch');
    return res.data;
  },

  bulkReview: async (
    reviews: Array<{ id: string; status: string; approvalRemarks?: string }>
  ): Promise<IManualBook[]> => {
    const res = await apiClient.put<IManualBook[]>(
      '/manual-bill-books/dispatches/bulk-review',
      { reviews }
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getNextNumber: async (
    branchId: string,
    dispatchDate: string
  ): Promise<{ nextNumber: string }> => {
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

  getAuthorizedUsers: async (
    search?: string
  ): Promise<Array<{ id: string; name: string }>> => {
    const params = search?.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : '';
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/manual-bill-books/users${params}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getBranchManagers: async (
    branchId: string,
    search?: string
  ): Promise<Array<{ id: string; name: string }>> => {
    const params = new URLSearchParams({ branchId });
    if (search?.trim()) params.set('search', search.trim());
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      `/manual-bill-books/branch-managers?${params.toString()}`
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

  getSelectablePages: async (
    params: IManualBookSelectablePagesQuery = {}
  ): Promise<IPaginatedResponse<IManualBookPageTracking>> => {
    const { limit, offset, ...filters } = params;
    const res = await apiClient.get<IPaginatedResponse<IManualBookPageTracking>>(
      `/manual-bill-books/pages/selectable${buildQueryString({ ...filters, limit, offset })}`
    );
    if (res.error) throw new Error(res.error);
    return normalizePaginatedResponse(res.data, limit, offset);
  },

  getAllSelectablePages: async (
    params?: Omit<IManualBookSelectablePagesQuery, 'limit' | 'offset'>
  ): Promise<IManualBookPageTracking[]> =>
    fetchAllMatching(pagination =>
      manualBillBookApi.getSelectablePages({ ...params, ...pagination })
    ),

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
    if (!res.data)
      throw new Error('Failed to allocate pages to delivery person');
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
    if (!res.data)
      throw new Error('Failed to deallocate pages from delivery person');
    return res.data;
  },

  getDeliveryPersons: async (): Promise<
    Array<{ id: string; name: string }>
  > => {
    const res = await apiClient.get<Array<{ id: string; name: string }>>(
      '/manual-bill-books/dp-mapping/delivery-persons'
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getBranchUsersForDP: async (): Promise<
    Array<{ id: string; name: string; isDeliveryPerson: boolean }>
  > => {
    const res = await apiClient.get<
      Array<{ id: string; name: string; isDeliveryPerson: boolean }>
    >('/manual-bill-books/dp-management/users');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  addDeliveryPerson: async (userId: string): Promise<{ success: boolean }> => {
    const res = await apiClient.post<{ success: boolean }>(
      '/manual-bill-books/dp-management/add',
      { userId }
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },

  removeDeliveryPerson: async (
    userId: string
  ): Promise<{ success: boolean }> => {
    const res = await apiClient.post<{ success: boolean }>(
      '/manual-bill-books/dp-management/remove',
      { userId }
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },

  getDPAllocatedPages: async (): Promise<IDPAllocatedPageRow[]> => {
    const res = await apiClient.get<IDPAllocatedPageRow[]>(
      '/manual-bill-books/dp-unmap/pages'
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  unmapFromDP: async (params: {
    dpUserId: string;
    manualBookId: string;
    mvFrom: number;
    mvTo: number;
    remarks?: string;
  }): Promise<{ success: boolean }> => {
    const res = await apiClient.post<{ success: boolean }>(
      '/manual-bill-books/dp-unmap/execute',
      params
    );
    if (res.error) throw new Error(res.error);
    return res.data || { success: false };
  },
};

export interface IDPAllocatedPageRow {
  dpUserId: string;
  dpName: string;
  manualBookId: string;
  dispatchNo: string;
  txnType: string;
  bookNoFrom: number;
  bookNoTo: number;
  mvFrom: number;
  mvTo: number;
  pageCount: number;
  /** Who assigned pages to this DP (cashier = pages return to cashier; BM = records deleted) */
  assignedByUserId: string | null;
  assignedByName: string | null;
  /** Non-null when assignedBy is a Cashier (pages return to that cashier on unmap) */
  returnToUserId: string | null;
  returnToUserName: string | null;
  pageIds: string[];
  book: {
    id: string;
    no: string;
    bookNoFrom: number;
    bookNoTo: number;
    vouchersPerBook: number;
    mvNoFrom: number;
    mvNoTo: number;
    branchId: string;
    transactionType: string;
  };
}

export interface IManualBookPageTracking {
  id: string;
  manualBookId: string;
  userId: string;
  pageNo: number;
  assignedBy?: string | null;
  assignedByName?: string | null;
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
