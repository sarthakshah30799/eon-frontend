import { apiClient } from '../api';
import type { IPaginatedResponse } from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { normalizePaginatedResponse } from '@/utils/paginatedList';
import type {
  AdvanceRefund,
  AdvanceRefundListQuery,
  AvailableAdvanceReceipt,
  AvailableAdvancesParams,
  CreateAdvanceRefundPayload,
  HonourAdvanceRefundPayload,
} from '@/modules/advanceRefund/types';

const BASE = '/advance-refunds';

export const advanceRefundApi = {
  list: async (params: AdvanceRefundListQuery = {}) => {
    const response = await apiClient.get<IPaginatedResponse<AdvanceRefund>>(
      `${BASE}${buildQueryString(params)}`
    );
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      params.limit,
      params.offset
    );
  },

  get: async (id: string) => {
    const response = await apiClient.get<AdvanceRefund>(`${BASE}/${id}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  create: async (payload: CreateAdvanceRefundPayload) => {
    const response = await apiClient.post<AdvanceRefund>(BASE, payload);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  honour: async (id: string, payload: HonourAdvanceRefundPayload) => {
    const response = await apiClient.post<AdvanceRefund>(
      `${BASE}/${id}/honour`,
      payload
    );
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getAvailableAdvances: async (params: AvailableAdvancesParams) => {
    const response = await apiClient.get<AvailableAdvanceReceipt[]>(
      `${BASE}/available-advances${buildQueryString(params)}`
    );
    if (response.error) throw new Error(response.error);
    return Array.isArray(response.data) ? response.data : [];
  },
};
