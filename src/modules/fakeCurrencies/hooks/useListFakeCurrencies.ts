import { useQuery } from '@tanstack/react-query';
import { transactionsApi, type ITransactionListQuery } from '@/api/transactions';

export const useListFakeCurrencies = (
  params: Omit<ITransactionListQuery, 'limit' | 'offset' | 'slug'>
) =>
  useQuery({
    queryKey: ['fake-currencies', 'all', params],
    queryFn: () =>
      transactionsApi.getAllTransactions({
        slug: 'FAKE_CURRENCY',
        search: params.search?.trim() || undefined,
        branchId: params.branchId || undefined,
      }),
  });

export default useListFakeCurrencies;
