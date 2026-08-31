import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chequebookApi, counterProfileApi } from '@/api';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import { useCallback } from 'react';
import type { AsyncSelectResponse } from '@/components/ui';
import { toPageQuery } from '@/utils/paginatedList';

export const useGetChequeBook = (id?: string) => {
  return useQuery({
    queryKey: ['cheque-book', id],
    queryFn: () => chequebookApi.findById(id!),
    enabled: Boolean(id),
  });
};

export const useGetNextChequeBookNumber = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (branchId: string, dispatchDate: string) => {
      return queryClient.fetchQuery({
        queryKey: ['cheque-book-next-number', branchId, dispatchDate],
        queryFn: () => chequebookApi.getNextNumber(branchId, dispatchDate),
      });
    },
    [queryClient]
  );
};

export const useLoadChequeBookBranchManagers = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (
      branchId: string,
      inputValue: string
    ): Promise<AsyncSelectResponse> => {
      const managers = await queryClient.fetchQuery({
        queryKey: [
          'cheque-book-branch-managers',
          branchId,
          inputValue || undefined,
        ],
        queryFn: () =>
          chequebookApi.getBranchManagers(branchId, inputValue || undefined),
      });
      return {
        options: managers.map(m => ({ value: m.id, label: m.name })),
        hasMore: false,
      };
    },
    [queryClient]
  );
};

export const useLoadBankAccounts = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string, page = 1) => {
      const limit = 30;
      const response = await queryClient.fetchQuery({
        queryKey: [
          'account-profiles',
          {
            ...toPageQuery(page, limit),
            search: inputValue || undefined,
            active: true,
          },
        ],
        queryFn: () =>
          accountProfileApi.getAccountProfiles({
            ...toPageQuery(page, limit),
            search: inputValue || undefined,
            active: true,
          }),
      });

      const bankAccounts = (response.data || []).filter(acc => {
        return (
          (acc.bankNature && acc.bankNature.value !== 'NONE') ||
          (acc.accountType && acc.accountType.value === 'BANK LEDGER') ||
          (acc.financialCode && acc.financialCode === 'BANKBL')
        );
      });

      return {
        options: bankAccounts.map(acc => ({
          value: acc.id,
          label: `${acc.accountCode} - ${acc.accountName}`,
        })),
        hasMore: response.hasMore,
      };
    },
    [queryClient]
  );
};

export const useReassignChequeBookDispatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chequebookApi.reassignDispatch(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheque-books'] });
    },
  });
};

export const useCreateChequeBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: unknown) => chequebookApi.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheque-books'] });
    },
  });
};

export const useLoadCounterProfilesForBranch = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (branchId: string) => {
      return queryClient.fetchQuery({
        queryKey: ['counter-profiles', { branchId, activeOnly: true }],
        queryFn: () =>
          counterProfileApi.getAllCounterProfiles({ branchId, activeOnly: true }),
      });
    },
    [queryClient]
  );
};
