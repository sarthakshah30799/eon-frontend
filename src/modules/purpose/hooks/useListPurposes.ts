import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { purposeApi } from '@/api/purpose';
import type { TransactionType } from '@/modules/transactions';
import type { IPurposeListQuery } from '../types';

export const useListPurposes = (
  search?: IPurposeListQuery | string,
  transactionType?: TransactionType,
  enabled = true
) => {
  const params: IPurposeListQuery | undefined =
    typeof search === 'string'
      ? { search: search.trim() || undefined, transactionType }
      : search;

  return useQuery({
    queryKey: [
      'purposes',
      params?.search?.trim() || '',
      params?.transactionType || transactionType || '',
      params?.partyProfileType || '',
      params?.limit,
      params?.offset,
    ],
    queryFn: () =>
      typeof search === 'string'
        ? purposeApi.getPurposes(search, transactionType)
        : purposeApi.getPurposes(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};
