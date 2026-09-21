import { apiClient } from '../api';
import type { IPaginatedResponse } from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { normalizePaginatedResponse } from '@/utils/paginatedList';
import type {
  CreditRequestFund,
  CreditRequestFundFormValues,
  CreditRequestFundListQuery,
} from '@/modules/creditRequestFund/types';

const BASE = '/credit-request-fund';

const buildPayload = (values: CreditRequestFundFormValues) => ({
  transactionDate: values.transactionDate,
  branchId: values.branchId || undefined,
  counterId: values.counterId || undefined,
  destinationBranchId: values.destinationBranchId,
  accountTypeOptionId: values.accountTypeOptionId,
  headerAccountId: values.headerAccountId,
  entityTypeOptionId: values.entityTypeOptionId,
  partyProfileId: values.partyProfileId,
  paidByPanNumber: values.paidByPanNumber || undefined,
  paidByPanName: values.paidByPanName || undefined,
  paidByPanDob: values.paidByPanDob || undefined,
  panHolderRelationOptionId: values.panHolderRelationOptionId || undefined,
  travelerPanNumber: values.travelerPanNumber || undefined,
  travelerPanName: values.travelerPanName || undefined,
  travelerPanDob: values.travelerPanDob || undefined,
  chequeNumber: values.chequeNumber || undefined,
  chequeDate: values.chequeDate || undefined,
  chequeBranch: values.chequeBranch || undefined,
  drawnOn: values.drawnOn || undefined,
  paymentMethod: values.paymentMethod || undefined,
  remarkOptionId: values.remarkOptionId || undefined,
  narration: values.narration,
  idempotencyKey: values.idempotencyKey,
  items: values.items.map(item => ({
    itemTypeOptionId: item.itemTypeOptionId,
    subledgerPartyProfileId: item.subledgerPartyProfileId || undefined,
    subledgerBranchId: item.subledgerBranchId || undefined,
    accountId: item.accountId,
    direction: item.direction,
    amount: Number(item.amount).toFixed(2),
  })),
});

export const creditRequestFundApi = {
  list: async (params: CreditRequestFundListQuery = {}) => {
    const response = await apiClient.get<IPaginatedResponse<CreditRequestFund>>(
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
    const response = await apiClient.get<CreditRequestFund>(`${BASE}/${id}`);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Credit Request Fund not found');
    return response.data;
  },
  nextNumber: async (branchId: string) => {
    const response = await apiClient.get<{ nextNumber?: string }>(
      `${BASE}/next-number${buildQueryString({ branchId })}`
    );
    if (response.error) throw new Error(response.error);
    return response.data?.nextNumber ?? '';
  },
  create: async (values: CreditRequestFundFormValues) => {
    const response = await apiClient.post<CreditRequestFund>(
      BASE,
      buildPayload(values)
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to create Credit Request Fund');
    return response.data;
  },
  update: async (id: string, values: CreditRequestFundFormValues) => {
    const response = await apiClient.patch<CreditRequestFund>(
      `${BASE}/${id}`,
      buildPayload(values)
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to update Credit Request Fund');
    return response.data;
  },
  cancel: async (id: string) => {
    const response = await apiClient.post<CreditRequestFund>(
      `${BASE}/${id}/cancel`
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to cancel Credit Request Fund');
    return response.data;
  },
  approve: async (id: string, transactionDate?: string) => {
    const response = await apiClient.post<CreditRequestFund>(
      `${BASE}/${id}/approve`,
      transactionDate ? { transactionDate } : {}
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to approve Credit Request Fund');
    return response.data;
  },
  reject: async (id: string, remarks: string) => {
    const response = await apiClient.post<CreditRequestFund>(
      `${BASE}/${id}/reject`,
      { remarks }
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to reject Credit Request Fund');
    return response.data;
  },
};
