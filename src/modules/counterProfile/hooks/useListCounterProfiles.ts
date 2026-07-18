import { useQuery } from '@tanstack/react-query';
import { counterProfileApi } from '@/api/counterProfile';
import type { ICounterProfileListQuery } from '../types';

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
