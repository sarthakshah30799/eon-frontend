import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manualBillBookApi, branchProfileApi, counterProfileApi } from '@/api';
import { useCallback } from 'react';
import type { AsyncSelectResponse } from '@/components/ui';

export const useGetManualBillBook = (id?: string) => {
  return useQuery({
    queryKey: ['manual-bill-book', id],
    queryFn: () => manualBillBookApi.findById(id!),
    enabled: Boolean(id),
  });
};

export const useGetNextManualBillBookNumber = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (branchId: string, dispatchDate: string) => {
      return queryClient.fetchQuery({
        queryKey: ['manual-bill-book-next-number', branchId, dispatchDate],
        queryFn: () => manualBillBookApi.getNextNumber(branchId, dispatchDate),
      });
    },
    [queryClient]
  );
};

export const useLoadManualBillBookBranchManagers = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (branchId: string, inputValue: string): Promise<AsyncSelectResponse> => {
      const managers = await queryClient.fetchQuery({
        queryKey: ['manual-bill-book-branch-managers', branchId, inputValue || undefined],
        queryFn: () => manualBillBookApi.getBranchManagers(branchId, inputValue || undefined),
      });
      return {
        options: managers.map(m => ({ value: m.id, label: m.name })),
        hasMore: false,
      };
    },
    [queryClient]
  );
};

export const useReassignManualBillBookDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manualBillBookApi.reassignDispatch(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-bill-books'] });
    },
  });
};

export const useLoadManualBillBookBranchOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string) => {
      const branches = await queryClient.fetchQuery({
        queryKey: ['branch-profiles', { search: inputValue || undefined, activeOnly: true }],
        queryFn: () => branchProfileApi.getBranchProfiles({ search: inputValue || undefined, status: 'active' }),
      });
      return {
        options: branches.map(branch => ({
          value: branch.id,
          label: `${branch.code} - ${branch.name}`,
        })),
        hasMore: false,
      };
    },
    [queryClient]
  );
};

export const useLoadManualBillBookCounterProfiles = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (branchId: string) => {
      return queryClient.fetchQuery({
        queryKey: ['counter-profiles', { branchId, activeOnly: true }],
        queryFn: () => counterProfileApi.getCounterProfiles({ branchId, activeOnly: true }),
      });
    },
    [queryClient]
  );
};

export const useValidateManualBillBookBookRange = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (bookNoFrom: number, bookNoTo: number) => {
      return queryClient.fetchQuery({
        queryKey: ['manual-bill-books-validate-book-range', bookNoFrom, bookNoTo],
        queryFn: () => manualBillBookApi.validateBookRange({ bookNoFrom, bookNoTo }),
      });
    },
    [queryClient]
  );
};

export const useValidateManualBillBookPageRange = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (mvNoFrom: number, mvNoTo: number) => {
      return queryClient.fetchQuery({
        queryKey: ['manual-bill-books-validate-page-range', mvNoFrom, mvNoTo],
        queryFn: () => manualBillBookApi.validatePageRange({ mvNoFrom, mvNoTo }),
      });
    },
    [queryClient]
  );
};
