import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manualBillBookApi } from '@/api';
import { useCallback } from 'react';
import type { AsyncSelectResponse } from '@/components/ui';

export const useListManualBillBookAuthorizedUsers = (branchId?: string) => {
  return useQuery({
    queryKey: ['manual-bill-books-authorized-users', branchId],
    queryFn: () => manualBillBookApi.getAuthorizedUsers(),
    enabled: Boolean(branchId),
  });
};

export const useLoadCashierOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const data = await queryClient.fetchQuery({
        queryKey: [
          'manual-bill-books-authorized-users-search',
          inputValue || undefined,
        ],
        queryFn: () =>
          manualBillBookApi.getAuthorizedUsers(inputValue || undefined),
      });
      return {
        options: data.map(c => ({ value: c.id, label: c.name })),
        hasMore: false,
      };
    },
    [queryClient]
  );
};

export const useListApprovedManualBillBooks = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (params: {
      branchId: string;
      status: string;
      transactionType?: string;
      bookNoFrom: number;
      bookNoTo: number;
    }) => {
      const res = await queryClient.fetchQuery({
        queryKey: ['manual-bill-books-matching', params],
        queryFn: () =>
          manualBillBookApi.findAllMatching({
            branchId: params.branchId,
            status: params.status,
            transactionType: params.transactionType,
            bookNoFrom: params.bookNoFrom,
            bookNoTo: params.bookNoTo,
          }),
      });
      return res;
    },
    [queryClient]
  );
};

export const useGetManualBillBookAllocations = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (matchedIds: string[]) => {
      return queryClient.fetchQuery({
        queryKey: ['manual-bill-book-allocations', matchedIds],
        queryFn: () => manualBillBookApi.getAllocations(matchedIds),
      });
    },
    [queryClient]
  );
};

export const useSaveManualBillBookAllocations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Array<{
        manualBookId: string;
        bookNo: number;
        userId: string;
        remarks?: string;
      }>
    ) => manualBillBookApi.saveAllocations(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['manual-bill-book-allocations'],
      });
    },
  });
};
