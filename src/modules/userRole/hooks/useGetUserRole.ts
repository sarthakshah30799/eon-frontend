import { useQuery } from '@tanstack/react-query';
import { userRoleApi } from '@/api/userRole';

export const useGetUserRole = (id: string) => {
  return useQuery({
    queryKey: ['user-role', id],
    queryFn: () => userRoleApi.getUserRoleById(id),
    enabled: Boolean(id),
  });
};

