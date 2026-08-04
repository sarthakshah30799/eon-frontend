import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export const useGetFakeCurrency = (id?: string) =>
  useQuery({
    queryKey: ['fake-currency', id],
    queryFn: () => transactionsApi.getTransactionById(id as string),
    enabled: Boolean(id),
  });

export default useGetFakeCurrency;
