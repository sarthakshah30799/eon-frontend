import { useQuery } from '@tanstack/react-query';
import { counterProfileApi } from '@/api/counterProfile';

export const useListCounterProfiles = (options?: {
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ['counter-profiles', options?.activeOnly === false],
    queryFn: () => counterProfileApi.getCounterProfiles(options),
  });
};
