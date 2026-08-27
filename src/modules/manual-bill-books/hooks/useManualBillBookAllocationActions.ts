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
    async (branchId: string, status: string) => {
      const res = await queryClient.fetchQuery({
        queryKey: ['manual-bill-books-list', branchId, status],
        queryFn: () =>
          manualBillBookApi.findAll({
            branchId,
            status,
            limit: 1000,
            offset: 0,
          }),
      });
      // findAll is always paginated; unwrap data
      return (
        (res as unknown as { data: import('@/api').IManualBook[] }).data ?? []
      );
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
