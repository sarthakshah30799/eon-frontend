import { useQuery } from '@tanstack/react-query';
import { stateProfileApi } from '@/api/stateProfile';

export const useGetStateProfile = (id: string) => {
  return useQuery({
    queryKey: ['state-profile', id],
    queryFn: () => stateProfileApi.getStateProfileById(id),
    enabled: Boolean(id),
  });
};

