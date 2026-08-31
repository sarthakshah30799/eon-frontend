import { apiClient } from '../api';
import type {
  AccountingVoucher,
  AvailableAdvance,
  VoucherFormValues,
  VoucherListQuery,
  VoucherType,
} from '@/modules/vouchers/types';
import type { IPaginatedResponse } from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { normalizePaginatedResponse } from '@/utils/paginatedList';

const pathFor = (type: VoucherType) =>
  type === 'RECEIPT'
    ? 'receipts'
    : type === 'PAYMENT'
      ? 'payments'
      : 'journal-vouchers';

export const vouchersApi = {
  list: async (type: VoucherType, params: VoucherListQuery = {}) => {
    const response = await apiClient.get<IPaginatedResponse<AccountingVoucher>>(
      `/${pathFor(type)}${buildQueryString(params)}`
    );
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      params.limit,
      params.offset
    );
  },
  get: async (type: VoucherType, id: string) => {
    const response = await apiClient.get<AccountingVoucher>(
      `/${pathFor(type)}/${id}`
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Voucher not found');
    return response.data;
  },
  nextNumber: async (type: VoucherType, branchId: string) => {
    const response = await apiClient.get<{ nextNumber: string }>(
      `/${pathFor(type)}/next-number${buildQueryString({ branchId })}`
    );
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
      items: values.items.map(
        ({
          itemTypeOptionId,
          subledgerPartyProfileId,
          accountId,
          direction,
          amount,
        }) => ({
          itemTypeOptionId,
          subledgerPartyProfileId: subledgerPartyProfileId || undefined,
          accountId,
          direction,
          amount: Number(amount).toFixed(2),
        })
      ),
      ...(type === 'JOURNAL'
        ? {}
        : {
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
    const response = await apiClient.post<AccountingVoucher>(
      `/${pathFor(type)}`,
      payload
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to create voucher');
    return response.data;
  },
  available: async (
    type: 'RECEIPT' | 'PAYMENT',
    params: {
      partyProfileId: string;
      branchId: string;
      counterId: string;
      transactionDate: string;
      paymentMethod: 'CASH' | 'CHEQUE';
      excludeTransactionId?: string;
      search?: string;
    }
  ) => {
    const response = await apiClient.get<AvailableAdvance[]>(
      `/${pathFor(type)}/available-advances${buildQueryString(params)}`
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },
};
