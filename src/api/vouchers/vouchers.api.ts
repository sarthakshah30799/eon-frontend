import { apiClient } from '../api';
import type {
  AccountingVoucher,
  AvailableAdvance,
  OutstandingBill,
  VoucherFormValues,
  VoucherListQuery,
  VoucherType,
} from '@/modules/vouchers/types';
import { isVoucherBillItemTypeValue } from '@/modules/vouchers/utils';
import type { IPaginatedResponse } from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { normalizePaginatedResponse } from '@/utils/paginatedList';

const pathFor = (type: VoucherType) => {
  if (type === 'RECEIPT') return 'receipts';
  if (type === 'PAYMENT') return 'payments';
  if (type === 'DEPOSIT_WITHDRAWAL') return 'deposit-withdrawals';
  if (type === 'ADVICE') return 'advice-debit-credit';
  return 'journal-vouchers';
};

const buildCreateItems = (type: VoucherType, values: VoucherFormValues) => {
  if (type === 'DEPOSIT_WITHDRAWAL') {
    const [deposited, withdrawal, fee] = values.items;
    const items = [
      {
        itemTypeOptionId: deposited.itemTypeOptionId,
        direction: deposited.direction,
        amount: Number(deposited.amount).toFixed(2),
        accountId: deposited.accountId,
      },
      {
        itemTypeOptionId: withdrawal.itemTypeOptionId,
        direction: withdrawal.direction,
        amount: Number(withdrawal.amount).toFixed(2),
        accountId: withdrawal.accountId,
      },
    ];
    const feeAmount = Number(fee?.amount ?? 0);
    if (fee && Number.isFinite(feeAmount) && feeAmount > 0) {
      items.push({
        itemTypeOptionId: fee.itemTypeOptionId,
        direction: fee.direction,
        amount: feeAmount.toFixed(2),
        accountId: '',
      });
    }
    return items.map(item => {
      const { accountId, ...rest } = item;
      return accountId
        ? { ...rest, accountId }
        : rest;
    });
  }

  return values.items.map(item => {
    const isBillLine = isVoucherBillItemTypeValue(item.itemTypeValue);
    return {
      itemTypeOptionId: item.itemTypeOptionId,
      subledgerPartyProfileId: item.subledgerPartyProfileId || undefined,
      direction: item.direction,
      amount: Number(item.amount).toFixed(2),
      ...(isBillLine
        ? { settledTransactionId: item.settledTransactionId ?? undefined }
        : { accountId: item.accountId }),
    };
  });
};

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
      items: buildCreateItems(type, values),
      ...(type === 'JOURNAL'
        ? {}
        : type === 'DEPOSIT_WITHDRAWAL'
          ? {
              chequeNumber: values.chequeNumber,
              chequeDate: values.chequeDate,
            }
          : type === 'ADVICE'
            ? {
                destinationBranchId: values.destinationBranchId,
                entityTypeOptionId: values.entityTypeOptionId,
                partyProfileId: values.partyProfileId,
                panNumber: values.panNumber || undefined,
                panName: values.panName || undefined,
                panDob: values.panDob || undefined,
              }
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
  honour: async (
    id: string,
    params: { branchId?: string; counterId?: string } = {}
  ) => {
    const response = await apiClient.post<AccountingVoucher>(
      `/advice-debit-credit/${id}/honour`,
      {
        branchId: params.branchId || undefined,
        counterId: params.counterId || undefined,
      }
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to honour advice voucher');
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
  outstandingBills: async (
    type: 'RECEIPT' | 'PAYMENT' | 'ADVICE',
    params: {
      partyProfileId: string;
      slug: string;
      branchId: string;
      counterId: string;
      transactionDate: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) => {
    const response = await apiClient.get<IPaginatedResponse<OutstandingBill>>(
      `/${pathFor(type)}/outstanding-bills${buildQueryString(params)}`
    );
    if (response.error) throw new Error(response.error);
    return normalizePaginatedResponse(
      response.data,
      params.limit,
      params.offset
    );
  },
};
