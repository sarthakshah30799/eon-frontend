import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { userRoleApi } from '@/api/userRole';
import type { IUserRoleListQuery } from '../types';

export const useListUserRoles = (
  search?: IUserRoleListQuery | string,
  enabled = true
) => {
  const params: IUserRoleListQuery | undefined =
    typeof search === 'string' ? { search: search.trim() || undefined } : search;

  return useQuery({
    queryKey: ['user-roles', params],
    queryFn: () => userRoleApi.getUserRoles(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};
