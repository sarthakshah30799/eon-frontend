import { useQuery, useQueryClient } from '@tanstack/react-query';
import { counterProfileApi } from '@/api/counterProfile';
import type { ICounterProfileListQuery } from '../types';
import { useCallback } from 'react';

export const useListCounterProfiles = (
  options?: ICounterProfileListQuery,
  enabled = true,
) => {
  return useQuery({
    queryKey: ['counter-profiles', options],
    queryFn: () => counterProfileApi.getCounterProfiles(options),
    enabled,
  });
};

export const useLoadCounterOptions = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (inputValue: string) => {
      const counters = await queryClient.fetchQuery({
        queryKey: ['counter-profiles', { search: inputValue || undefined, activeOnly: true }],
        queryFn: () => counterProfileApi.getCounterProfiles({ search: inputValue || undefined, activeOnly: true }),
      });
      return {
        options: counters.map(counter => ({
          value: counter.id,
          label: `${counter.counterNo} - ${counter.name}`,
        })),
        hasMore: false,
      };
    },
    [queryClient]
  );
};
