import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks';
import { transactionsApi } from '@/api/transactions';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import {
  formatDateTime,
  formatReferenceLabel,
} from '@/utils';
import type { TransactionListRow } from '../components';
import type {
  ITransactionEntity,
  TransactionType,
} from '../types';
import { TransactionTypeEnum } from '../types';

export interface TransactionAccountPostingOption {
  value: string;
  label: string;
}

const transactionTypeOptions: TransactionAccountPostingOption[] = [
  { value: TransactionTypeEnum.PURCHASE, label: 'Purchase' },
  { value: TransactionTypeEnum.SALE, label: 'Sale' },
];

export const useTransactionAccountPostings = (enabled = true) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [partyProfileId, setPartyProfileId] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const {
    data: partyProfilesResponse,
    isLoading: isPartyProfilesLoading,
  } = useListPartyProfiles(
    {
      page: 1,
      limit: 500,
      activeOnly: true,
    },
    undefined,
    enabled,
    true,
  );

  const partyProfileOptions = useMemo<TransactionAccountPostingOption[]>(
    () =>
      (partyProfilesResponse?.data ?? []).map(profile => ({
        value: profile.id,
        label: `${profile.code}${profile.name ? ` - ${profile.name}` : ''}` || profile.id,
      })),
    [partyProfilesResponse]
  );

  const selectedPartyProfile = useMemo(
    () =>
      partyProfileOptions.find(option => option.value === partyProfileId) ?? null,
    [partyProfileId, partyProfileOptions]
  );

  const selectedTransactionType = useMemo(
    () =>
      transactionTypeOptions.find(option => option.value === transactionType) ?? null,
    [transactionType]
  );

  const filterOptions = useCallback(
    (options: TransactionAccountPostingOption[], inputValue: string) => {
      const normalizedInput = inputValue.trim().toLowerCase();

      if (!normalizedInput) {
        return options;
      }

      return options.filter(option => {
        return (
          option.label.toLowerCase().includes(normalizedInput) ||
          option.value.toLowerCase().includes(normalizedInput)
        );
      });
    },
    []
  );

  const loadPartyProfileOptions = useCallback(
    async (inputValue: string) => ({
      options: filterOptions(partyProfileOptions, inputValue),
    }),
    [filterOptions, partyProfileOptions]
  );

  const loadTransactionTypeOptions = useCallback(
    async (inputValue: string) => ({
      options: filterOptions(transactionTypeOptions, inputValue),
    }),
    [filterOptions]
  );

  const {
    data: transactions = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      'transactions',
      'account-postings',
      debouncedSearch,
      partyProfileId,
      transactionType,
    ],
    enabled,
    queryFn: () =>
      transactionsApi.getTransactions({
        search: debouncedSearch || undefined,
        partyProfileId: partyProfileId || undefined,
        transactionType: transactionType ? (transactionType as TransactionType) : undefined,
      }),
  });

  const rebuildMutation = useMutation({
    mutationFn: (transactionId: string) =>
      transactionsApi.requestAccountPostingRebuild(transactionId),
    onMutate: async transactionId => {
      setActiveTransactionId(transactionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Account posting rebuild queued');
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to queue account posting rebuild'
      );
    },
    onSettled: () => {
      setActiveTransactionId(null);
    },
  });

  const rows = useMemo<TransactionListRow[]>(
    () =>
      (transactions as ITransactionEntity[]).map(transaction => ({
        id: transaction.id,
        number: transaction.number ?? '-',
        branch: formatReferenceLabel(transaction.branchSnapshot),
        partyProfile: formatReferenceLabel(transaction.partyProfileSnapshot),
        transactionType: transaction.transactionType,
        tradeMode: transaction.tradeMode,
        status: transaction.status,
        createdAt: formatDateTime(transaction.createdAt, true),
      })),
    [transactions]
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setPartyProfileId('');
    setTransactionType('');
  }, []);

  const queueAccountPostingRebuild = useCallback(
    async (transactionId: string) => {
      await rebuildMutation.mutateAsync(transactionId);
    },
    [rebuildMutation]
  );

  return {
    search,
    setSearch,
    setPartyProfileId,
    setTransactionType,
    selectedPartyProfile,
    selectedTransactionType,
    loadPartyProfileOptions,
    loadTransactionTypeOptions,
    rows,
    isLoading,
    isFetching,
    error,
    isPartyProfilesLoading,
    activeTransactionId,
    isRebuildPending: rebuildMutation.isPending,
    resetFilters,
    queueAccountPostingRebuild,
  };
};

export default useTransactionAccountPostings;
