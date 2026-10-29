import { apiClient } from '../api';
import type { IPaginatedResponse } from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { normalizePaginatedResponse } from '@/utils/paginatedList';
import type {
  AdvanceAdjustment,
  AdvanceAdjustmentListQuery,
  CreateAdvanceAdjustmentPayload,
  OutstandingSaleForAdjustment,
  OutstandingSalesParams,
} from '@/modules/advanceAdjustment/types';

const BASE = '/advance-adjustments';

export const advanceAdjustmentApi = {
  list: async (params: AdvanceAdjustmentListQuery = {}) => {
    const response = await apiClient.get<IPaginatedResponse<AdvanceAdjustment>>(
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
    const response = await apiClient.get<AdvanceAdjustment>(`${BASE}/${id}`);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  create: async (payload: CreateAdvanceAdjustmentPayload) => {
    const response = await apiClient.post<AdvanceAdjustment>(BASE, payload);
    if (response.error) throw new Error(response.error);
    return response.data;
  },

  getOutstandingSales: async (params: OutstandingSalesParams) => {
    const response = await apiClient.get<
      IPaginatedResponse<OutstandingSaleForAdjustment>
    >(`${BASE}/outstanding-sales${buildQueryString(params)}`);
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      params.limit,
      params.offset
    );
  },
};
