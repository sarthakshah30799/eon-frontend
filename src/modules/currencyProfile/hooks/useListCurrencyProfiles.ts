import { useQuery } from '@tanstack/react-query';
import { currencyProfileApi } from '@/api/currencyProfile';

export const useListCurrencyProfiles = (search?: string, activeOnly = true) => {
  return useQuery({
    queryKey: ['currency-profiles', search?.trim() || '', activeOnly],
    queryFn: () => currencyProfileApi.getCurrencyProfiles(search),
    select: currencies =>
      activeOnly
        ? currencies.filter(currency => currency.active !== false)
        : currencies,
  });
};
