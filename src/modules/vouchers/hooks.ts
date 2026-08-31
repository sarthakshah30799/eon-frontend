import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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
export const useCreateVoucher = (type: VoucherType) => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: VoucherFormValues) => vouchersApi.create(type, values),
    onSuccess: voucher => {
      void client.invalidateQueries({ queryKey: ['vouchers', type] });
      void client.invalidateQueries({ queryKey: ['available-advances'] });
      toast.success(`${voucher.number} created successfully`);
    },
    onError: error =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to create voucher'
      ),
  });
  return { ...mutation, createVoucher: mutation.mutateAsync };
};
