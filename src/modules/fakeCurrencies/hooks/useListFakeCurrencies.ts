import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export const useListFakeCurrencies = (params: {
  search?: string;
  branchId?: string;
}) =>
  useQuery({
    queryKey: ['fake-currencies', params],
    queryFn: () =>
      transactionsApi.getTransactions({
        slug: 'FAKE_CURRENCY',
        search: params.search?.trim() || undefined,
        branchId: params.branchId || undefined,
      }),
  });

export default useListFakeCurrencies;
