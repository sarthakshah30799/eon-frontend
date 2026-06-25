import { useQuery } from '@tanstack/react-query';
import { userProfileApi } from '@/api/userProfile';

export const useListUserProfiles = (options?: {
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ['user-profiles', options?.activeOnly === false],
    queryFn: () => userProfileApi.getUserProfiles(options),
  });
};
