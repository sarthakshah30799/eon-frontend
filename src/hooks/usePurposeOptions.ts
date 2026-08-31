import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { purposeApi } from '@/api/purpose';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import type { TransactionType } from '@/modules/transactions';
import type { PurposePartyProfileType } from '@/modules/purpose/types';
import { pageToOffset, toAsyncSelectPage } from '@/utils/paginatedList';

const PURPOSE_OPTIONS_STALE_TIME = 5 * 60 * 1000;

const toAsyncSelectOption = (purpose: {
  id: string;
  code: string;
  description: string;
}): AsyncSelectOption => ({
  value: purpose.id,
  label: `${purpose.code} - ${purpose.description}`,
});

const filterOptions = (
  options: AsyncSelectOption[],
  inputValue: string
): AsyncSelectOption[] => {
  const normalized = inputValue.trim().toLowerCase();

  if (!normalized) {
    return options;
  }

  return options.filter(option => {
    const value = String(option.value ?? '')
      .trim()
      .toLowerCase();
    const label = String(option.label ?? '')
      .trim()
      .toLowerCase();
    return value.includes(normalized) || label.includes(normalized);
  });
};

const createQueryKey = (
  transactionType: TransactionType | null | undefined,
  partyProfileType: PurposePartyProfileType | null | undefined,
  search: string
) => ['purposes', transactionType ?? '', partyProfileType ?? '', search];

export const usePurposeOptions = (
  transactionType?: TransactionType | null,
  partyProfileType?: PurposePartyProfileType | null
) => {
  const normalizedTransactionType = transactionType ?? null;
  const normalizedPartyProfileType = partyProfileType ?? null;
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () =>
      createQueryKey(normalizedTransactionType, normalizedPartyProfileType, ''),
    [normalizedPartyProfileType, normalizedTransactionType]
  );

  const query = useQuery({
    queryKey,
    queryFn: () =>
      purposeApi.getPurposes({
        transactionType: normalizedTransactionType ?? undefined,
        partyProfileType: normalizedPartyProfileType ?? undefined,
        limit: PAGINATION_DEFAULTS.LIMIT,
        offset: PAGINATION_DEFAULTS.OFFSET,
      }),
    staleTime: PURPOSE_OPTIONS_STALE_TIME,
    enabled: true,
  });

  const loadOptions = useCallback(
    async (inputValue: string, page = 1): Promise<AsyncSelectResponse> => {
      const search = inputValue.trim();
      const limit = PAGINATION_DEFAULTS.LIMIT;
      const cacheKey = createQueryKey(
        normalizedTransactionType,
        normalizedPartyProfileType,
        search
      );
      const response = await queryClient.fetchQuery({
        queryKey: [...cacheKey, page, limit],
        queryFn: () =>
          purposeApi.getPurposes({
            search: search || undefined,
            transactionType: normalizedTransactionType ?? undefined,
            partyProfileType: normalizedPartyProfileType ?? undefined,
            limit,
            offset: pageToOffset(page, limit),
          }),
        staleTime: PURPOSE_OPTIONS_STALE_TIME,
      });

      const pageResult = toAsyncSelectPage(response, toAsyncSelectOption);
      return {
        options: filterOptions(pageResult.options, inputValue),
        hasMore: pageResult.hasMore,
      };
    },
    [normalizedPartyProfileType, normalizedTransactionType, queryClient]
  );

  return {
    defaultOptions: useMemo(
      () => (query.data?.data ?? []).map(toAsyncSelectOption),
      [query.data]
    ),
    loadOptions,
    isLoading: query.isLoading,
  };
};
