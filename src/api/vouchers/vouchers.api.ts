import { apiClient } from '../api';
import type { AccountingVoucher, AvailableAdvance, VoucherFormValues, VoucherListResponse, VoucherType } from '@/modules/vouchers/types';

const pathFor = (type: VoucherType) => type === 'RECEIPT' ? 'receipts' : type === 'PAYMENT' ? 'payments' : 'journal-vouchers';
const queryString = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return query.toString() ? `?${query.toString()}` : '';
};

export const vouchersApi = {
  list: async (type: VoucherType, params: Record<string, string | number | undefined> = {}) => {
    const response = await apiClient.get<VoucherListResponse>(`/${pathFor(type)}${queryString(params)}`);
    if (response.error) throw new Error(response.error);
    return response.data ?? { data: [], page: 1, limit: 20, totalItems: 0, totalPages: 0 };
  },
  get: async (type: VoucherType, id: string) => {
    const response = await apiClient.get<AccountingVoucher>(`/${pathFor(type)}/${id}`);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Voucher not found');
    return response.data;
  },
  nextNumber: async (type: VoucherType, branchId: string) => {
    const response = await apiClient.get<{ nextNumber: string }>(`/${pathFor(type)}/next-number${queryString({ branchId })}`);
    if (response.error) throw new Error(response.error);
    return response.data?.nextNumber ?? '';
  },
  create: async (type: VoucherType, values: VoucherFormValues) => {
    const payload = {
      transactionDate: values.transactionDate,
      branchId: values.branchId || undefined,
      counterId: values.counterId || undefined,
      remarkOptionId: values.remarkOptionId || undefined,
      narration: values.narration.trim(),
      idempotencyKey: values.idempotencyKey,
      items: values.items.map(({ itemTypeOptionId, subledgerPartyProfileId, accountId, direction, amount }) => ({
        itemTypeOptionId,
        subledgerPartyProfileId: subledgerPartyProfileId || undefined,
        accountId,
        direction,
        amount: Number(amount).toFixed(2),
      })),
      ...(type === 'JOURNAL' ? {} : {
        accountTypeOptionId: values.accountTypeOptionId,
        headerAccountId: values.headerAccountId,
        entityTypeOptionId: values.entityTypeOptionId,
        partyProfileId: values.partyProfileId,
        panNumber: values.panNumber || undefined,
        panName: values.panName || undefined,
        panDob: values.panDob || undefined,
        chequeNumber: values.chequeNumber || undefined,
        chequeDate: values.chequeDate || undefined,
        chequeBranch: values.chequeBranch || undefined,
        drawnOn: values.drawnOn || undefined,
      }),
    };
    const response = await apiClient.post<AccountingVoucher>(`/${pathFor(type)}`, payload);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to create voucher');
    return response.data;
  },
  available: async (type: 'RECEIPT' | 'PAYMENT', params: { partyProfileId: string; branchId: string; counterId: string; transactionDate: string; paymentMethod: 'CASH' | 'CHEQUE'; excludeTransactionId?: string; search?: string }) => {
    const response = await apiClient.get<AvailableAdvance[]>(`/${pathFor(type)}/available-advances${queryString(params)}`);
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
};
