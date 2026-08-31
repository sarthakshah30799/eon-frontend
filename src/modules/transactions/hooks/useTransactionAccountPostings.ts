import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { transactionsApi } from '@/api/transactions';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import { formatDateTime, formatReferenceLabel } from '@/utils';
import type { TransactionListRow } from '../components';
import type { TransactionType } from '../types';
import { TransactionTypeEnum } from '../types';

export interface TransactionAccountPostingOption {
  value: string;
  label: string;
}

const transactionTypeOptions: TransactionAccountPostingOption[] = [
  { value: TransactionTypeEnum.PURCHASE, label: 'Purchase' },
  { value: TransactionTypeEnum.SALE, label: 'Sell' },
];

export const useTransactionAccountPostings = (enabled = true) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search.trim(), 400);
  const [partyProfileId, setPartyProfileId] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(
    null
  );

  const resetOffset = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!next.has('limit')) {
        next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return next;
    });
  }, [setSearchParams]);

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (value.trim()) {
          next.set('search', value.trim());
        } else {
          next.delete('search');
        }
        next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
        if (!next.has('limit')) {
          next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const { data: partyProfilesResponse, isLoading: isPartyProfilesLoading } =
    useListPartyProfiles(
      {
        limit: 500,
        offset: 0,
        activeOnly: true,
      },
      undefined,
      enabled,
      true
    );

  const partyProfileOptions = useMemo<TransactionAccountPostingOption[]>(
    () =>
      (partyProfilesResponse?.data ?? []).map(profile => ({
        value: profile.id,
        label:
          `${profile.code}${profile.name ? ` - ${profile.name}` : ''}` ||
          profile.id,
      })),
    [partyProfilesResponse]
  );

  const selectedPartyProfile = useMemo(
    () =>
      partyProfileOptions.find(option => option.value === partyProfileId) ??
      null,
    [partyProfileId, partyProfileOptions]
  );

  const selectedTransactionType = useMemo(
    () =>
      transactionTypeOptions.find(option => option.value === transactionType) ??
      null,
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

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      partyProfileId: partyProfileId || undefined,
      transactionType: transactionType
        ? (transactionType as TransactionType)
        : undefined,
    }),
    [debouncedSearch, partyProfileId, transactionType]
  );

  const {
    rows: transactions,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['transactions', 'account-postings'],
    queryFn: params => transactionsApi.getTransactions(params),
    filters,
    enabled,
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
        error instanceof Error
          ? error.message
          : 'Failed to queue account posting rebuild'
      );
    },
    onSettled: () => {
      setActiveTransactionId(null);
    },
  });

  const rows = useMemo<TransactionListRow[]>(
    () =>
      transactions.map(transaction => ({
        id: transaction.id,
        number: transaction.number ?? '-',
        branch: formatReferenceLabel(transaction.branchSnapshot),
        partyProfile: formatReferenceLabel(transaction.partyProfileSnapshot),
        transactionType: transaction.transactionType,
        tradeMode: transaction.tradeMode,
        status: transaction.status,
        createdAt: formatDateTime(transaction.createdAt),
      })),
    [transactions]
  );

  const handlePartyProfileChange = useCallback(
    (nextPartyProfileId: string) => {
      setPartyProfileId(nextPartyProfileId);
      resetOffset();
    },
    [resetOffset]
  );

  const handleTransactionTypeChange = useCallback(
    (nextTransactionType: string) => {
      setTransactionType(nextTransactionType);
      resetOffset();
    },
    [resetOffset]
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setPartyProfileId('');
    setTransactionType('');
  }, [setSearch]);

  const queueAccountPostingRebuild = useCallback(
    async (transactionId: string) => {
      await rebuildMutation.mutateAsync(transactionId);
    },
    [rebuildMutation]
  );

  return {
    search,
    setSearch,
    setPartyProfileId: handlePartyProfileChange,
    setTransactionType: handleTransactionTypeChange,
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
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
};

export default useTransactionAccountPostings;
