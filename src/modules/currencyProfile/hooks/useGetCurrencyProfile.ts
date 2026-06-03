import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';

export const useGetCurrencyProfile = (id: string) => {
  return useQuery({
    queryKey: ['currency-profile', id],
    queryFn: () => currencyProfileApi.getCurrencyProfileById(id),
    enabled: Boolean(id),
  });
};
