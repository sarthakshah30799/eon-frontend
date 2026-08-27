import { apiClient } from '../api';
import type { CardStockSnapshot } from '../cardStock';

export const CardStockSettlementDocumentKind = {
  BRANCH_HO: 'BRANCH_HO',
  HO_ISSUER: 'HO_ISSUER',
} as const;

export type CardStockSettlementDocumentKind =
  (typeof CardStockSettlementDocumentKind)[keyof typeof CardStockSettlementDocumentKind];

export const CardStockSettlementDocumentStatus = {
  PENDING_HO_ACCEPTANCE: 'PENDING_HO_ACCEPTANCE',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  ISSUER_SETTLED: 'ISSUER_SETTLED',
} as const;

export type CardStockSettlementDocumentStatus =
  (typeof CardStockSettlementDocumentStatus)[keyof typeof CardStockSettlementDocumentStatus];

export const CardStockSettlementSaleKind = {
  FRESH: 'FRESH',
  RELOAD: 'RELOAD',
} as const;

export type CardStockSettlementSaleKind =
  (typeof CardStockSettlementSaleKind)[keyof typeof CardStockSettlementSaleKind];

export interface CardStockSettlementDocumentItem {
  id: string;
  series: string;
  kitNumber: string;
  maskedCardNumber: string;
  denomination: string;
  saleKind: CardStockSettlementSaleKind;
  saleBuyRate: string;
  buyRate: string;
  settlementAmount: string;
  issuerRate?: string | null;
  issuerSettlementAmount?: string | null;
  status?: string;
  branchId?: string;
  branchSnapshot?: CardStockSnapshot;
  productId?: string;
  productSnapshot?: CardStockSnapshot;
}

export interface CardStockSettlementDocument {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  kind: CardStockSettlementDocumentKind;
  status: CardStockSettlementDocumentStatus;
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
  items?: CardStockSettlementDocumentItem[];
}

export interface CardStockUnsettledItem {
  id: string;
  series: string;
  kitNumber: string;
  maskedCardNumber: string;
  denomination: string;
  saleKind: CardStockSettlementSaleKind;
  saleBuyRate: string;
  buyRate: string;
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

export interface CardStockSettlementDocumentFilters {
  status?: CardStockSettlementDocumentStatus;
  kind?: CardStockSettlementDocumentKind;
  issuerPartyProfileId?: string;
  currencyId?: string;
  branchId?: string;
  hoBranchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateCardStockSettlementDocumentPayload {
  kind: CardStockSettlementDocumentKind;
  issuerPartyProfileId: string;
  currencyId: string;
  branchId?: string;
  hoBranchId?: string;
  transactionDate: string;
  reference?: string;
  remarks?: string;
  items: Array<{ id: string; rate: string }>;
}

const queryString = (filters: object) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === 'string' && value) params.set(key, value);
  });
  const value = params.toString();
  return value ? `?${value}` : '';
};

export const cardSettlementApi = {
  list: async (
    filters: CardStockSettlementDocumentFilters = {}
  ): Promise<CardStockSettlementDocument[]> => {
    const response = await apiClient.get<CardStockSettlementDocument[]>(
      `/card-stock/settlements${queryString(filters)}`
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
  get: async (id: string): Promise<CardStockSettlementDocument> => {
    const response = await apiClient.get<CardStockSettlementDocument>(
      `/card-stock/settlements/${id}`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'CARD settlement not found');
    return response.data;
  },
  listUnsettled: async (filters: {
    kind: CardStockSettlementDocumentKind;
    issuerPartyProfileId: string;
    currencyId: string;
    branchId?: string;
    hoBranchId?: string;
  }): Promise<CardStockUnsettledItem[]> => {
    const response = await apiClient.get<CardStockUnsettledItem[]>(
      `/card-stock/settlements/unsettled${queryString(filters)}`
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
  create: async (
    payload: CreateCardStockSettlementDocumentPayload
  ): Promise<CardStockSettlementDocument> => {
    const response = await apiClient.post<CardStockSettlementDocument>(
      '/card-stock/settlements',
      payload
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to create CARD settlement');
    return response.data;
  },
  accept: async (id: string): Promise<CardStockSettlementDocument> => {
    const response = await apiClient.post<CardStockSettlementDocument>(
      `/card-stock/settlements/${id}/accept`
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to accept CARD settlement');
    return response.data;
  },
  reject: async (
    id: string,
    reason: string
  ): Promise<CardStockSettlementDocument> => {
    const response = await apiClient.post<CardStockSettlementDocument>(
      `/card-stock/settlements/${id}/reject`,
      { reason }
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to reject CARD settlement');
    return response.data;
  },
  cancel: async (
    id: string,
    reason: string
  ): Promise<CardStockSettlementDocument> => {
    const response = await apiClient.post<CardStockSettlementDocument>(
      `/card-stock/settlements/${id}/cancel`,
      { reason }
    );
    if (response.error || !response.data)
      throw new Error(response.error || 'Failed to cancel CARD settlement');
    return response.data;
  },
};
