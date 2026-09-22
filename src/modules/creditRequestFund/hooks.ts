import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { creditRequestFundApi } from '@/api/creditRequestFund';
import type {
  CreditRequestFundFormValues,
  CreditRequestFundListQuery,
} from './types';

export const creditRequestFundKeys = {
  all: ['credit-request-fund'] as const,
  list: (params: CreditRequestFundListQuery) =>
    [...creditRequestFundKeys.all, 'list', params] as const,
  detail: (id: string) => [...creditRequestFundKeys.all, 'detail', id] as const,
  nextNumber: (branchId: string) =>
    [...creditRequestFundKeys.all, 'next-number', branchId] as const,
};

export const useCreditRequestFundList = (
  params: CreditRequestFundListQuery = {}
) =>
  useQuery({
    queryKey: creditRequestFundKeys.list(params),
    queryFn: () => creditRequestFundApi.list(params),
  });

export const useCreditRequestFund = (id: string) =>
  useQuery({
    queryKey: creditRequestFundKeys.detail(id),
    queryFn: () => creditRequestFundApi.get(id),
    enabled: Boolean(id),
  });

export const useCreditRequestFundNextNumber = (branchId: string) =>
  useQuery({
    queryKey: creditRequestFundKeys.nextNumber(branchId),
    queryFn: () => creditRequestFundApi.nextNumber(branchId),
    enabled: Boolean(branchId),
  });

export const useCreateCreditRequestFund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreditRequestFundFormValues) =>
      creditRequestFundApi.create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creditRequestFundKeys.all,
      });
      toast.success('Credit Request Fund created');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create Credit Request Fund'
      );
    },
  });
};

export const useUpdateCreditRequestFund = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreditRequestFundFormValues) =>
      creditRequestFundApi.update(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creditRequestFundKeys.all,
      });
      toast.success('Credit Request Fund updated');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update Credit Request Fund'
      );
    },
  });
};

export const useCancelCreditRequestFund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => creditRequestFundApi.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creditRequestFundKeys.all,
      });
      toast.success('Credit Request Fund cancelled');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to cancel Credit Request Fund'
      );
    },
  });
};

export const useApproveCreditRequestFund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      transactionDate,
    }: {
      id: string;
      transactionDate?: string;
    }) => creditRequestFundApi.approve(id, transactionDate),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creditRequestFundKeys.all,
      });
      toast.success('Credit Request Fund approved');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to approve Credit Request Fund'
      );
    },
  });
};

export const useRejectCreditRequestFund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      creditRequestFundApi.reject(id, remarks),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: creditRequestFundKeys.all,
      });
      toast.success('Credit Request Fund rejected');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to reject Credit Request Fund'
      );
    },
  });
};
