import { useQuery } from '@tanstack/react-query';
import { counterProfileApi } from '@/api/counterProfile';

export const useListCounterProfiles = () => {
  return useQuery({
    queryKey: ['counter-profiles'],
    queryFn: counterProfileApi.getCounterProfiles,
  });
};
