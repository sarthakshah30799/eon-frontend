import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { purposeApi } from '@/api/purpose';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import type { TransactionType } from '@/modules/transactions';
import type { PurposePartyProfileType } from '@/modules/purpose/types';

const PURPOSE_OPTIONS_STALE_TIME = 5 * 60 * 1000;

const toAsyncSelectOption = (purpose: {
  id: string;
  code: string;
  description: string;
}): AsyncSelectOption => ({
  value: purpose.id,
  label: `${purpose.code} - ${purpose.description}`,
});

const filterOptions = (options: AsyncSelectOption[], inputValue: string): AsyncSelectOption[] => {
  const normalized = inputValue.trim().toLowerCase();

  if (!normalized) {
    return options;
  }

  return options.filter(option => {
    const value = String(option.value ?? '').trim().toLowerCase();
    const label = String(option.label ?? '').trim().toLowerCase();
    return value.includes(normalized) || label.includes(normalized);
  });
};

const createQueryKey = (
  transactionType: TransactionType | null | undefined,
  partyProfileType: PurposePartyProfileType | null | undefined,
  search: string
) => [
  'purposes',
  transactionType ?? '',
  partyProfileType ?? '',
  search,
];

export const usePurposeOptions = (
  transactionType?: TransactionType | null,
  partyProfileType?: PurposePartyProfileType | null
) => {
  const normalizedTransactionType = transactionType ?? null;
  const normalizedPartyProfileType = partyProfileType ?? null;
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => createQueryKey(normalizedTransactionType, normalizedPartyProfileType, ''),
    [normalizedPartyProfileType, normalizedTransactionType]
  );

  const query = useQuery({
    queryKey,
    queryFn: () =>
      purposeApi.getPurposes(
        '',
        normalizedTransactionType ?? undefined,
        normalizedPartyProfileType ?? undefined
      ),
    staleTime: PURPOSE_OPTIONS_STALE_TIME,
    enabled: true,
  });

  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const search = inputValue.trim();
      const cacheKey = createQueryKey(normalizedTransactionType, normalizedPartyProfileType, search);
      const purposes = await queryClient.fetchQuery({
        queryKey: cacheKey,
        queryFn: () =>
          purposeApi.getPurposes(
            search,
            normalizedTransactionType ?? undefined,
            normalizedPartyProfileType ?? undefined
          ),
        staleTime: PURPOSE_OPTIONS_STALE_TIME,
      });

      const options = purposes.map(toAsyncSelectOption);
      return {
        options: filterOptions(options, inputValue),
      };
    },
    [normalizedPartyProfileType, normalizedTransactionType, queryClient]
  );

  return {
    defaultOptions: useMemo(() => (query.data ?? []).map(toAsyncSelectOption), [query.data]),
    loadOptions,
    isLoading: query.isLoading,
  };
};
