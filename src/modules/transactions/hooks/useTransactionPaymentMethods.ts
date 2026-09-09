import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export const useTransactionPaymentMethods = (enabled = true) =>
  useQuery({
    queryKey: ['transactions', 'payment-methods'],
    queryFn: () => transactionsApi.getPaymentMethods(),
    enabled,
  });

export default useTransactionPaymentMethods;
