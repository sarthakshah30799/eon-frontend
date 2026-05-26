import { useQuery } from '@tanstack/react-query';
import { userRoleApi } from '@/api/userRole';

export const useListUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: userRoleApi.getUserRoles,
  });
};

