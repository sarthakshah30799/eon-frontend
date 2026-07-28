import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { countryProfileApi } from '@/api/countryProfile';
import type { ICountryProfileListQuery } from '@/modules/countryProfile/types';
import { useCallback } from 'react';
import { normalizeCodeValue } from '@/utils';

export const useListCountryProfiles = (
  params?: ICountryProfileListQuery
) => {
  return useQuery({
    queryKey: ['country-profiles', params],
    queryFn: () => countryProfileApi.getCountryProfiles(params),
    placeholderData: keepPreviousData,
  });
};

export const useValidateCountryCode = (currentId?: string) => {
  const queryClient = useQueryClient();
  return useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const res = await queryClient.fetchQuery({
        queryKey: ['country-profiles', { page: 1, limit: 20, code: normalizedCode }],
        queryFn: () => countryProfileApi.getCountryProfiles({ page: 1, limit: 20, code: normalizedCode }),
      });

      return (res.data ?? []).some(
        country =>
          normalizeCodeValue(country.code) === normalizedCode &&
          country.id !== currentId
      );
    },
    [queryClient, currentId]
  );
};
