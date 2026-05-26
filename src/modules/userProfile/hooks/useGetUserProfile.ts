import { useQuery } from '@tanstack/react-query';
import { userProfileApi } from '@/api/userProfile';

export const useGetUserProfile = (id: string) => {
  return useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => userProfileApi.getUserProfileById(id),
    enabled: Boolean(id),
  });
};

