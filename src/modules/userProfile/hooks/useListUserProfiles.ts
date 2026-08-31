import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { userProfileApi } from '@/api/userProfile';
import type { IUserProfileListQuery } from '../types';

export const useListUserProfiles = (
  options?: IUserProfileListQuery,
  enabled = true
) => {
  return useQuery({
    queryKey: [
      'user-profiles',
      options?.activeOnly === false,
      options?.search?.trim() || '',
      options?.branchId?.trim() || '',
      options?.roleFilter?.trim() || '',
      options?.limit,
      options?.offset,
    ],
    queryFn: () => userProfileApi.getUserProfiles(options),
    placeholderData: keepPreviousData,
    enabled,
  });
};
