import { apiClient } from '../api';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

export const DealCoverStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type DealCoverStatus =
  (typeof DealCoverStatus)[keyof typeof DealCoverStatus];

export interface DealCoverSnapshot {
  id?: string;
  code?: string;
  name?: string;
  label?: string;
  currencyCode?: string;
  currencyName?: string;
  productCode?: string;
  productDescription?: string;
  accountCode?: string;
  accountName?: string;
}

export interface DealCoverRatePayload {
  branchId: string;
  transactionDate: string;
  bankAccountProfileId: string;
  productId: string;
  partyProfileType: string;
  partyProfileId: string;
  marketingExecutiveId?: string | null;
  passengerId?: string | null;
  passengerName?: string | null;
  passengerPan?: string | null;
  passengerPanHolder?: string | null;
  passengerPanDob?: string | null;
  passengerPassport?: string | null;
  purposeId: string;
  subpurposeId?: string | null;
  currencyId: string;
  issuerPartyProfileId: string;
  feAmount: string;
  dealRate: string;
  inrAmount: string;
  fbChargeAmount?: string;
  narration?: string | null;
  maturityOptionId: string;
}

export interface IDealCoverRate extends DealCoverRatePayload {
  id: string;
  status: DealCoverStatus;
  transactionNumber: string;
  dealNo?: string | null;
  bookingRate?: string | null;
  rejectionReason?: string | null;
  branchSnapshot?: DealCoverSnapshot | null;
  bankAccountProfileSnapshot?: DealCoverSnapshot | null;
  productSnapshot?: DealCoverSnapshot | null;
  partyProfileSnapshot?: DealCoverSnapshot | null;
  marketingExecutiveSnapshot?: DealCoverSnapshot | null;
  purposeSnapshot?: DealCoverSnapshot | null;
  subpurposeSnapshot?: DealCoverSnapshot | null;
  currencySnapshot?: DealCoverSnapshot | null;
  issuerPartyProfileSnapshot?: DealCoverSnapshot | null;
  maturityOptionSnapshot?: DealCoverSnapshot | null;
  consumedTransactionItemId?: string | null;
  consumedTransactionId?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface DealCoverRateListFilters extends IOffsetPaginationParams {
  status?: DealCoverStatus;
  branchId?: string;
  bankAccountProfileId?: string;
  productId?: string;
  issuerPartyProfileId?: string;
  currencyId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DealCoverAckCurrencyGroup {
  currencyId: string;
  currencySnapshot?: DealCoverSnapshot | null;
  totalFeAmount: string;
  weightedAvgDealRate: string;
  totalInrAmount: string;
  items: IDealCoverRate[];
}

export interface ApproveDealCoverPayload {
  dealNo: string;
  bookingRate: string;
}

export interface RejectDealCoverPayload {
  reason: string;
}

const basePath = '/deal-covers';

export const dealCoverRateApi = {
  list: async (
    filters: DealCoverRateListFilters = {}
  ): Promise<IPaginatedResponse<IDealCoverRate>> => {
    const response = await apiClient.get<IPaginatedResponse<IDealCoverRate>>(
      `${basePath}${buildQueryString(filters)}`
    );
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      filters.limit,
      filters.offset
    );
  },

  listAll: async (
    filters: Omit<DealCoverRateListFilters, 'limit' | 'offset'> = {}
  ): Promise<IDealCoverRate[]> =>
    fetchAllMatching(pagination =>
      dealCoverRateApi.list({ ...filters, ...pagination })
    ),

  listForAck: async (
    filters: DealCoverRateListFilters = {}
  ): Promise<IPaginatedResponse<IDealCoverRate>> => {
    const response = await apiClient.get<IPaginatedResponse<IDealCoverRate>>(
      `${basePath}/ack${buildQueryString(filters)}`
    );
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      filters.limit,
      filters.offset
    );
  },

  get: async (id: string): Promise<IDealCoverRate> => {
    const response = await apiClient.get<IDealCoverRate>(`${basePath}/${id}`);
    if (response.error || !response.data)
      throw new Error(response.error || 'Deal cover rate not found');
    return response.data;
  },

  create: async (payload: DealCoverRatePayload): Promise<IDealCoverRate> => {
    const response = await apiClient.post<IDealCoverRate>(basePath, payload);
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to create deal cover rate');
    return response.data;
  },

  update: async (
    id: string,
    payload: Partial<DealCoverRatePayload>
  ): Promise<IDealCoverRate> => {
    const response = await apiClient.patch<IDealCoverRate>(
      `${basePath}/${id}`,
      payload
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to update deal cover rate');
    return response.data;
  },

  cancel: async (id: string): Promise<IDealCoverRate> => {
    const response = await apiClient.post<IDealCoverRate>(
      `${basePath}/${id}/cancel`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to cancel deal cover rate');
    return response.data;
  },

  approve: async (
    id: string,
    payload: ApproveDealCoverPayload
  ): Promise<IDealCoverRate> => {
    const response = await apiClient.post<IDealCoverRate>(
      `${basePath}/${id}/approve`,
      payload
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to approve deal cover rate');
    return response.data;
  },

  reject: async (
    id: string,
    payload: RejectDealCoverPayload
  ): Promise<IDealCoverRate> => {
    const response = await apiClient.post<IDealCoverRate>(
      `${basePath}/${id}/reject`,
      payload
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to reject deal cover rate');
    return response.data;
  },
};
