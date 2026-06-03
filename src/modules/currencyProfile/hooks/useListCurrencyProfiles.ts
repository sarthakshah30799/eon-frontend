import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';

export const useListCurrencyProfiles = () => {
  return useQuery({
    queryKey: ['currency-profiles'],
    queryFn: currencyProfileApi.getCurrencyProfiles,
  });
};
