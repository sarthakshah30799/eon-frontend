import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';

export const useListCurrencyProfiles = (search?: string) => {
  return useQuery({
    queryKey: ['currency-profiles', search?.trim() || ''],
    queryFn: () => currencyProfileApi.getCurrencyProfiles(search),
  });
};
