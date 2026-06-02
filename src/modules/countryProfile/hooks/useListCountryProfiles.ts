import { useQuery } from '@tanstack/react-query';
import { countryProfileApi } from '@/api/countryProfile';

export const useListCountryProfiles = () => {
  return useQuery({
    queryKey: ['country-profiles'],
    queryFn: countryProfileApi.getCountryProfiles,
  });
};

