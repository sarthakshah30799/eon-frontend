import { useQuery } from '@tanstack/react-query';
import { transactionPoliciesApi } from '@/api/transactionPolicies';

export const useListBackdateWindows = () => {
  return useQuery({
    queryKey: ['monthly-lock-windows'],
    queryFn: () => transactionPoliciesApi.listBackdateWindows(),
  });
};
