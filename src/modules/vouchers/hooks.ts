import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { vouchersApi } from '@/api/vouchers';
import type { VoucherFormValues, VoucherListQuery, VoucherType } from './types';

export const useVoucherList = (
  type: VoucherType,
  params: VoucherListQuery = {}
) =>
  useQuery({
    queryKey: ['vouchers', type, params],
    queryFn: () => vouchersApi.list(type, params),
  });
export const useVoucher = (type: VoucherType, id: string) =>
  useQuery({
    queryKey: ['voucher', type, id],
    queryFn: () => vouchersApi.get(type, id),
    enabled: Boolean(id),
  });
export const useVoucherNextNumber = (type: VoucherType, branchId: string) =>
  useQuery({
    queryKey: ['voucher-next-number', type, branchId],
    queryFn: () => vouchersApi.nextNumber(type, branchId),
    enabled: Boolean(branchId),
  });
export type AvailableAdvanceQueryParams = {
  partyProfileId: string;
  branchId: string;
  counterId: string;
  transactionDate: string;
  paymentMethod: 'CASH' | 'CHEQUE';
  excludeTransactionId?: string;
};

export const useAvailableAdvances = (
  type: 'RECEIPT' | 'PAYMENT',
  params: AvailableAdvanceQueryParams,
  enabled = true
) =>
  useQuery({
    queryKey: ['available-advances', type, params],
    queryFn: () => vouchersApi.available(type, params),
    enabled:
      enabled &&
      Boolean(
        params.partyProfileId &&
        params.branchId &&
        params.counterId &&
        params.transactionDate &&
        params.paymentMethod
      ),
  });

export type OutstandingBillQueryParams = {
  partyProfileId: string;
  slug: string;
  branchId: string;
  counterId: string;
  transactionDate: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export const useOutstandingBills = (
  type: 'RECEIPT' | 'PAYMENT',
  params: OutstandingBillQueryParams,
  enabled = true
) =>
  useQuery({
    queryKey: ['outstanding-bills', type, params],
    queryFn: () => vouchersApi.outstandingBills(type, params),
    enabled:
      enabled &&
      Boolean(
        params.partyProfileId &&
        params.slug &&
        params.branchId &&
        params.counterId &&
        params.transactionDate
      ),
  });

export const useVoucherItemTypeCategoryOptions = () =>
  useQuery({
    queryKey: ['category-options', 'voucher_item_type'],
    queryFn: () =>
      categoryOptionsApi.getCategoryOptionsByCode(
        CategoryOptionCodeEnum.VoucherItemType
      ),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateVoucher = (type: VoucherType) => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: VoucherFormValues) => vouchersApi.create(type, values),
    onSuccess: voucher => {
      void client.invalidateQueries({ queryKey: ['vouchers', type] });
      void client.invalidateQueries({ queryKey: ['available-advances'] });
      void client.invalidateQueries({ queryKey: ['outstanding-bills'] });
      toast.success(`${voucher.number} created successfully`);
    },
    onError: error =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to create voucher'
      ),
  });
  return { ...mutation, createVoucher: mutation.mutateAsync };
};

export const useRecordVoucherPrint = (type: VoucherType) => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof vouchersApi.recordPrint>[2];
    }) => vouchersApi.recordPrint(type, id, payload),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: ['voucher', type, variables.id] });
      void client.invalidateQueries({ queryKey: ['vouchers', type] });
    },
  });

  return {
    ...mutation,
    recordVoucherPrint: mutation.mutateAsync,
  };
};
