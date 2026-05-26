import { useQuery } from '@tanstack/react-query';
import { userProfileApi } from '@/api/userProfile';

export const useListUserProfiles = () => {
  return useQuery({
    queryKey: ['user-profiles'],
    queryFn: userProfileApi.getUserProfiles,
  });
};

