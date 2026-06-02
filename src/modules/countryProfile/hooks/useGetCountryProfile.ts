import { useQuery } from '@tanstack/react-query';
import { countryProfileApi } from '@/api/countryProfile';

export const useGetCountryProfile = (id: string) => {
  return useQuery({
    queryKey: ['country-profile', id],
    queryFn: () => countryProfileApi.getCountryProfileById(id),
    enabled: Boolean(id),
  });
};

