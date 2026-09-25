import { apiClient } from '../api';
import type { CardStockSnapshot } from '../cardStock';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

export const ProductSettlementType = {
  CARD: 'CARD',
  TT: 'TT',
} as const;

export type ProductSettlementType =
  (typeof ProductSettlementType)[keyof typeof ProductSettlementType];

export const ProductSettlementDocumentKind = {
  BRANCH_HO: 'BRANCH_HO',
  HO_ISSUER: 'HO_ISSUER',
} as const;

export type ProductSettlementDocumentKind =
  (typeof ProductSettlementDocumentKind)[keyof typeof ProductSettlementDocumentKind];

export const ProductSettlementDocumentStatus = {
  PENDING_HO_ACCEPTANCE: 'PENDING_HO_ACCEPTANCE',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  ISSUER_SETTLED: 'ISSUER_SETTLED',
} as const;

export type ProductSettlementDocumentStatus =
  (typeof ProductSettlementDocumentStatus)[keyof typeof ProductSettlementDocumentStatus];

export const ProductSettlementSaleKind = {
  FRESH: 'FRESH',
  RELOAD: 'RELOAD',
} as const;

export type ProductSettlementSaleKind =
  (typeof ProductSettlementSaleKind)[keyof typeof ProductSettlementSaleKind];

export interface ProductSettlementDocumentItem {
  id: string;
  type: ProductSettlementType;
  productCode?: string | null;
  series: string;
  kitNumber?: string | null;
  maskedCardNumber?: string | null;
  denomination: string;
  saleKind?: ProductSettlementSaleKind | string | null;
  saleBuyRate: string;
  buyRate: string;
  bookingRate?: string | null;
  settlementAmount: string;
  issuerRate?: string | null;
  issuerSettlementAmount?: string | null;
  status?: string;
  branchId?: string;
  branchSnapshot?: CardStockSnapshot;
  productId?: string;
  productSnapshot?: CardStockSnapshot;
}

export interface ProductSettlementDocument {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  kind: ProductSettlementDocumentKind;
  status: ProductSettlementDocumentStatus;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot: CardStockSnapshot;
  currencyId: string;
  currencySnapshot: CardStockSnapshot;
  branchId: string;
  branchSnapshot: CardStockSnapshot;
  hoBranchId: string;
  hoBranchSnapshot: CardStockSnapshot;
  reference?: string | null;
  remarks?: string | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  postingTransactionId?: string | null;
  itemCount?: number;
  items?: ProductSettlementDocumentItem[];
}

export interface ProductUnsettledItem {
  id: string;
  type: ProductSettlementType;
  productCode?: string | null;
  series: string;
  kitNumber?: string | null;
  maskedCardNumber?: string | null;
  denomination: string;
  saleKind?: ProductSettlementSaleKind | string | null;
  saleBuyRate: string;
  buyRate: string;
  bookingRate?: string | null;
  settlementAmount: string;
  branchId: string;
  branchSnapshot: CardStockSnapshot;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot: CardStockSnapshot;
  currencyId: string;
  currencySnapshot: CardStockSnapshot;
  productId: string;
  productSnapshot: CardStockSnapshot;
}

export interface ProductSettlementDocumentFilters extends IOffsetPaginationParams {
  status?: ProductSettlementDocumentStatus;
  kind?: ProductSettlementDocumentKind;
  issuerPartyProfileId?: string;
  currencyId?: string;
  branchId?: string;
  hoBranchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateProductSettlementDocumentPayload {
  kind: ProductSettlementDocumentKind;
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
const basePath = '/product-settlements';

const asUnsettledList = (
  payload: IPaginatedResponse<ProductUnsettledItem> | ProductUnsettledItem[] | null | undefined
): ProductUnsettledItem[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
};

export const productSettlementApi = {
  list: async (
    filters: ProductSettlementDocumentFilters = {}
  ): Promise<IPaginatedResponse<ProductSettlementDocument>> => {
    const response = await apiClient.get<
      IPaginatedResponse<ProductSettlementDocument>
    >(`${basePath}${queryString(filters)}`);
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      filters.limit,
      filters.offset
    );
  },

  listAll: async (
    filters: Omit<ProductSettlementDocumentFilters, 'limit' | 'offset'> = {}
  ): Promise<ProductSettlementDocument[]> =>
    fetchAllMatching(pagination =>
      productSettlementApi.list({ ...filters, ...pagination })
    ),

  get: async (id: string): Promise<ProductSettlementDocument> => {
    const response = await apiClient.get<ProductSettlementDocument>(
      `${basePath}/${id}`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Product settlement not found');
    return response.data;
  },

  listUnsettled: async (filters: {
    kind: ProductSettlementDocumentKind;
    issuerPartyProfileId: string;
    currencyId: string;
    branchId?: string;
    hoBranchId?: string;
  }): Promise<ProductUnsettledItem[]> => {
    const response = await apiClient.get<
      IPaginatedResponse<ProductUnsettledItem> | ProductUnsettledItem[]
    >(`${basePath}/unsettled${queryString(filters)}`);
    if (response.error) throw new Error(response.error);
    return asUnsettledList(response.data);
  },

  create: async (
    payload: CreateProductSettlementDocumentPayload
  ): Promise<ProductSettlementDocument> => {
    const response = await apiClient.post<ProductSettlementDocument>(
      basePath,
      payload
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to create product settlement');
    return response.data;
  },

  accept: async (id: string): Promise<ProductSettlementDocument> => {
    const response = await apiClient.post<ProductSettlementDocument>(
      `${basePath}/${id}/accept`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to accept product settlement');
    return response.data;
  },

  reject: async (
    id: string,
    reason: string
  ): Promise<ProductSettlementDocument> => {
    const response = await apiClient.post<ProductSettlementDocument>(
      `${basePath}/${id}/reject`,
      { reason }
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to reject product settlement');
    return response.data;
  },

  cancel: async (
    id: string,
    reason: string
  ): Promise<ProductSettlementDocument> => {
    const response = await apiClient.post<ProductSettlementDocument>(
      `${basePath}/${id}/cancel`,
      { reason }
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to cancel product settlement');
    return response.data;
  },
};
