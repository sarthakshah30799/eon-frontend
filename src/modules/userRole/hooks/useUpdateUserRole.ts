import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userRoleApi } from '@/api/userRole';
import type { ICreateUserRole } from '../types';
import { USER_ROLE_TEXTS } from '../constants';
import { syncUserRoleCache } from '../utils';

export const useUpdateUserRole = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateUserRole) => userRoleApi.updateUserRole(id, data),
    onSuccess: updatedRole => {
      if (updatedRole) {
        syncUserRoleCache(queryClient, updatedRole);
        toast.success(USER_ROLE_TEXTS.UPDATE_SUCCESS);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-role', id] });
    },
    onError: () => {
      toast.error(USER_ROLE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitUserRole: mutation.mutateAsync,
    updateUserRoleStatus: async (roleId: string, isActive: boolean) => {
      const updatedRole = await userRoleApi.updateUserRoleStatus(
        roleId,
        isActive
      );

      if (updatedRole) {
        syncUserRoleCache(queryClient, updatedRole);
        toast.success(USER_ROLE_TEXTS.UPDATE_SUCCESS);
      }

      return updatedRole;
    },
  };
};
