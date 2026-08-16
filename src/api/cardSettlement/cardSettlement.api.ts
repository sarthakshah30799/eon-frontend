import { apiClient } from '../api';
import type { CardStockSnapshot } from '../cardStock';

export const CardStockSettlementStatus = {
  PENDING_BRANCH_SETTLEMENT: 'PENDING_BRANCH_SETTLEMENT',
  PENDING_HO_ACCEPTANCE: 'PENDING_HO_ACCEPTANCE',
  PENDING_ISSUER_SETTLEMENT: 'PENDING_ISSUER_SETTLEMENT',
  ISSUER_SETTLED: 'ISSUER_SETTLED',
  CANCELLED: 'CANCELLED',
} as const;

export type CardStockSettlementStatus = typeof CardStockSettlementStatus[keyof typeof CardStockSettlementStatus];

export interface CardStockSettlement {
  id: string;
  cardId: string;
  transactionId: string;
  transactionItemId: string;
  branchId: string;
  branchSnapshot: CardStockSnapshot;
  hoBranchId: string;
  hoBranchSnapshot: CardStockSnapshot;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot: CardStockSnapshot;
  currencyId: string;
  currencySnapshot: CardStockSnapshot;
  productId: string;
  productSnapshot: CardStockSnapshot;
  passengerId?: string | null;
  passengerSnapshot?: CardStockSnapshot | null;
  series: string;
  cardSeries: string;
  kitNumber: string;
  maskedCardNumber: string;
  denomination: string;
  buyRate: string;
  settlementAmount: string;
  saleDate: string;
  settlementMode: 'AUTO' | 'MANUAL';
  branchRequestedDate?: string | null;
  branchReference?: string | null;
  branchRemarks?: string | null;
  branchRequestedAt?: string | null;
  branchRequestedById?: string | null;
  branchSettlementDate?: string | null;
  branchSettlementEntryId?: string | null;
  hoAcceptedAt?: string | null;
  hoAcceptedById?: string | null;
  hoRejectedAt?: string | null;
  hoRejectedById?: string | null;
  hoRejectionReason?: string | null;
  issuerSettlementDate?: string | null;
  issuerReference?: string | null;
  issuerRemarks?: string | null;
  issuerSettlementEntryId?: string | null;
  status: CardStockSettlementStatus;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CardStockSettlementFilters {
  status?: CardStockSettlementStatus;
  issuerPartyProfileId?: string;
  currencyId?: string;
  branchId?: string;
  saleDateFrom?: string;
  saleDateTo?: string;
  settlementDateFrom?: string;
  settlementDateTo?: string;
}

export interface BulkSettleCardStockPayload {
  settlementIds: string[];
  issuerSettlementDate: string;
  issuerReference: string;
  remarks?: string;
}

export interface SubmitBranchCardSettlementPayload {
  settlementIds: string[];
  settlementDate: string;
  reference?: string;
  remarks?: string;
}

const queryString = (filters: CardStockSettlementFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const value = params.toString();
  return value ? `?${value}` : '';
};

export const cardSettlementApi = {
  list: async (filters: CardStockSettlementFilters = {}): Promise<CardStockSettlement[]> => {
    const response = await apiClient.get<CardStockSettlement[]>(`/card-stock/settlements${queryString(filters)}`);
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
  get: async (id: string): Promise<CardStockSettlement> => {
    const response = await apiClient.get<CardStockSettlement>(`/card-stock/settlements/${id}`);
    if (response.error || !response.data) throw new Error(response.error || 'CARD settlement not found');
    return response.data;
  },
  bulkSettle: async (payload: BulkSettleCardStockPayload): Promise<CardStockSettlement[]> => {
    const response = await apiClient.post<CardStockSettlement[]>('/card-stock/settlements/bulk-settle', payload);
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
  submitBranch: async (payload: SubmitBranchCardSettlementPayload): Promise<CardStockSettlement[]> => {
    const response = await apiClient.post<CardStockSettlement[]>('/card-stock/settlements/branch-submit', payload);
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
  acceptBranch: async (settlementIds: string[]): Promise<CardStockSettlement[]> => {
    const response = await apiClient.post<CardStockSettlement[]>('/card-stock/settlements/branch-accept', { settlementIds });
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
  rejectBranch: async (settlementIds: string[], reason: string): Promise<CardStockSettlement[]> => {
    const response = await apiClient.post<CardStockSettlement[]>('/card-stock/settlements/branch-reject', { settlementIds, reason });
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
  cancel: async ({ id, reason }: { id: string; reason: string }): Promise<CardStockSettlement> => {
    const response = await apiClient.post<CardStockSettlement>(`/card-stock/settlements/${id}/cancel`, { reason });
    if (response.error || !response.data) throw new Error(response.error || 'Failed to cancel CARD settlement');
    return response.data;
  },
};
