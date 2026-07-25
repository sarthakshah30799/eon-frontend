import { useQuery } from '@tanstack/react-query';
import { countryGroupApi } from '@/api/countryGroup';

export const useListCountryGroups = () => {
  return useQuery({
    queryKey: ['country-groups'],
    queryFn: () => countryGroupApi.getCountryGroups(),
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
