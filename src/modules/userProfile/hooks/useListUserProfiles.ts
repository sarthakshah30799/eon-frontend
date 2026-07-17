import { useQuery } from '@tanstack/react-query';
import { userProfileApi } from '@/api/userProfile';

export const useListUserProfiles = (options?: {
  activeOnly?: boolean;
  search?: string;
  branchId?: string;
  roleFilter?: string;
}) => {
  return useQuery({
    queryKey: [
      'user-profiles',
      options?.activeOnly === false,
      options?.search?.trim() || '',
      options?.branchId?.trim() || '',
      options?.roleFilter?.trim() || '',
    ],
    queryFn: () => userProfileApi.getUserProfiles(options),
  });
};
