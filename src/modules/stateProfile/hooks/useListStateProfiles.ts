import { useQuery } from '@tanstack/react-query';
import { stateProfileApi } from '@/api/stateProfile';

export const useListStateProfiles = () => {
  return useQuery({
    queryKey: ['state-profiles'],
    queryFn: stateProfileApi.getStateProfiles,
  });
};

