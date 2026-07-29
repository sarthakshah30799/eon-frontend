import { useQuery, useQueryClient } from '@tanstack/react-query';
import { countryGroupApi } from '@/api/countryGroup';
import { useCallback } from 'react';

export const useListCountryGroups = (search?: string) => {
  return useQuery({
    queryKey: ['country-groups', search],
    queryFn: () => countryGroupApi.getCountryGroups(search),
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useLoadCountryGroupOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string) => {
      const groups = await queryClient.fetchQuery({
        queryKey: ['country-groups', inputValue || undefined],
        queryFn: () => countryGroupApi.getCountryGroups(inputValue || undefined),
      });
      return {
        options: groups.map(group => ({
          value: group.id,
          label: group.name,
        })),
      };
    },
    [queryClient]
  );
};
