import { useQuery } from '@tanstack/react-query';
import { userRoleApi } from '@/api/userRole';

export const useListUserRoles = (search?: string) => {
  return useQuery({
    queryKey: ['user-roles', search?.trim() || ''],
    queryFn: () => userRoleApi.getUserRoles(search),
  });
};
