import { useQuery } from '@tanstack/react-query';
import { purposeApi } from '@/api/purpose';
import type { TransactionType } from '@/modules/transactions';

export const useListPurposes = (
  search?: string,
  transactionType?: TransactionType
) => {
  return useQuery({
    queryKey: ['purposes', search?.trim() || '', transactionType || ''],
    queryFn: () => purposeApi.getPurposes(search, transactionType),
  });
};
