import { apiClient } from '../api';
import type { DealCoverSnapshot } from '../dealCoverRate';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

export const TtSettlementDocumentKind = {
  BRANCH_HO: 'BRANCH_HO',
  HO_ISSUER: 'HO_ISSUER',
} as const;

export type TtSettlementDocumentKind =
  (typeof TtSettlementDocumentKind)[keyof typeof TtSettlementDocumentKind];

export const TtSettlementDocumentStatus = {
  PENDING_HO_ACCEPTANCE: 'PENDING_HO_ACCEPTANCE',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  ISSUER_SETTLED: 'ISSUER_SETTLED',
} as const;

export type TtSettlementDocumentStatus =
  (typeof TtSettlementDocumentStatus)[keyof typeof TtSettlementDocumentStatus];

export interface TtSettlementDocumentItem {
  id: string;
  dealCoverId?: string;
  dealNo?: string | null;
  feAmount: string;
  dealRate: string;
  bookingRate?: string | null;
  customerRate?: string | null;
  saleBuyRate?: string;
  buyRate?: string;
  settlementAmount: string;
  issuerRate?: string | null;
  issuerSettlementAmount?: string | null;
  status?: string;
  branchId?: string;
  branchSnapshot?: DealCoverSnapshot;
  productId?: string;
  productSnapshot?: DealCoverSnapshot;
}

export interface TtSettlementDocument {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  kind: TtSettlementDocumentKind;
  status: TtSettlementDocumentStatus;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot: DealCoverSnapshot;
  currencyId: string;
  currencySnapshot: DealCoverSnapshot;
  branchId: string;
  branchSnapshot: DealCoverSnapshot;
  hoBranchId: string;
  hoBranchSnapshot: DealCoverSnapshot;
  reference?: string | null;
  remarks?: string | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  postingTransactionId?: string | null;
  itemCount?: number;
  items?: TtSettlementDocumentItem[];
}

export interface TtUnsettledItem {
  id: string;
  dealCoverId?: string;
  dealNo?: string | null;
  feAmount: string;
  dealRate: string;
  bookingRate?: string | null;
  customerRate?: string | null;
  saleBuyRate: string;
  buyRate: string;
  settlementAmount: string;
  branchId: string;
  branchSnapshot: DealCoverSnapshot;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot: DealCoverSnapshot;
  currencyId: string;
  currencySnapshot: DealCoverSnapshot;
  productId: string;
  productSnapshot: DealCoverSnapshot;
}

export interface TtSettlementDocumentFilters extends IOffsetPaginationParams {
  status?: TtSettlementDocumentStatus;
  kind?: TtSettlementDocumentKind;
  issuerPartyProfileId?: string;
  currencyId?: string;
  branchId?: string;
  hoBranchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateTtSettlementDocumentPayload {
  kind: TtSettlementDocumentKind;
  issuerPartyProfileId: string;
  currencyId: string;
  branchId?: string;
  hoBranchId?: string;
  transactionDate: string;
  reference?: string;
  remarks?: string;
  items: Array<{ id: string; rate: string }>;
}

const queryString = (filters: object) => buildQueryString(filters);
const basePath = '/tt-deal/settlements';

export const ttSettlementApi = {
  list: async (
    filters: TtSettlementDocumentFilters = {}
  ): Promise<IPaginatedResponse<TtSettlementDocument>> => {
    const response = await apiClient.get<
      IPaginatedResponse<TtSettlementDocument>
    >(`${basePath}${queryString(filters)}`);
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      filters.limit,
      filters.offset
    );
  },

  listAll: async (
    filters: Omit<TtSettlementDocumentFilters, 'limit' | 'offset'> = {}
  ): Promise<TtSettlementDocument[]> =>
    fetchAllMatching(pagination =>
      ttSettlementApi.list({ ...filters, ...pagination })
    ),

  get: async (id: string): Promise<TtSettlementDocument> => {
    const response = await apiClient.get<TtSettlementDocument>(
      `${basePath}/${id}`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'TT settlement not found');
    return response.data;
  },

  listUnsettled: async (filters: {
    kind: TtSettlementDocumentKind;
    issuerPartyProfileId: string;
    currencyId: string;
    branchId?: string;
    hoBranchId?: string;
  }): Promise<TtUnsettledItem[]> => {
    const response = await apiClient.get<TtUnsettledItem[]>(
      `${basePath}/unsettled${queryString(filters)}`
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  create: async (
    payload: CreateTtSettlementDocumentPayload
  ): Promise<TtSettlementDocument> => {
    const response = await apiClient.post<TtSettlementDocument>(
      basePath,
      payload
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to create TT settlement');
    return response.data;
  },

  accept: async (id: string): Promise<TtSettlementDocument> => {
    const response = await apiClient.post<TtSettlementDocument>(
      `${basePath}/${id}/accept`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to accept TT settlement');
    return response.data;
  },

  reject: async (
    id: string,
    reason: string
  ): Promise<TtSettlementDocument> => {
    const response = await apiClient.post<TtSettlementDocument>(
      `${basePath}/${id}/reject`,
      { reason }
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to reject TT settlement');
    return response.data;
  },

  cancel: async (
    id: string,
    reason: string
  ): Promise<TtSettlementDocument> => {
    const response = await apiClient.post<TtSettlementDocument>(
      `${basePath}/${id}/cancel`,
      { reason }
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to cancel TT settlement');
    return response.data;
  },
};
