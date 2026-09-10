import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { partyProfileApi } from '@/api/partyProfile';
import { transactionsApi } from '@/api/transactions';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';
import { formatDateTime, formatReferenceLabel } from '@/utils';
import type { AsyncSelectResponse } from '@/components/ui';
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
  const [selectedPartyProfile, setSelectedPartyProfile] =
    useState<TransactionAccountPostingOption | null>(null);
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
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      if (!enabled) {
        return { options: [], hasMore: false };
      }

      const limit = PAGINATION_DEFAULTS.LIMIT;
      const response = await partyProfileApi.getPartyProfiles({
        search: inputValue.trim() || undefined,
        activeOnly: true,
        limit,
        offset: pageToOffset(page, limit),
      });

      return toAsyncSelectPage(response, profile => ({
        value: profile.id,
        label:
          `${profile.code}${profile.name ? ` - ${profile.name}` : ''}` ||
          profile.id,
      }));
    },
    [enabled]
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
      partyProfileId: selectedPartyProfile?.value || undefined,
      transactionType: transactionType
        ? (transactionType as TransactionType)
        : undefined,
    }),
    [debouncedSearch, selectedPartyProfile, transactionType]
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

  const selectedTransactionType = useMemo(
    () =>
      transactionTypeOptions.find(option => option.value === transactionType) ??
      null,
    [transactionType]
  );

  const handlePartyProfileChange = useCallback(
    (option: TransactionAccountPostingOption | null) => {
      setSelectedPartyProfile(option);
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
    setSelectedPartyProfile(null);
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
    setSelectedPartyProfile: handlePartyProfileChange,
    setTransactionType: handleTransactionTypeChange,
    selectedPartyProfile,
    selectedTransactionType,
    loadPartyProfileOptions,
    loadTransactionTypeOptions,
    rows,
    isLoading,
    isFetching,
    error,
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
