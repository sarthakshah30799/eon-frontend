import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { countryProfileApi } from '@/api/countryProfile';
import type { ICountryProfileListQuery } from '@/modules/countryProfile/types';

export const useListCountryProfiles = (
  params?: ICountryProfileListQuery
) => {
  return useQuery({
    queryKey: ['country-profiles', params],
    queryFn: () => countryProfileApi.getCountryProfiles(params),
    placeholderData: keepPreviousData,
  });
};
