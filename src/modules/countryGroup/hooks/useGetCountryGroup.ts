import { useQuery } from '@tanstack/react-query';
import { countryGroupApi } from '@/api/countryGroup';

export const useGetCountryGroup = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['country-groups', id],
    queryFn: () => countryGroupApi.getCountryGroupById(id),
    enabled: enabled && Boolean(id),
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
