import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userRoleApi } from '@/api/userRole';
import { USER_ROLE_TEXTS } from '../constants';
import type { IUserRole } from '../types';
import { syncUserRoleCache } from '../utils';

export const useUpdateUserRoleStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userRoleApi.updateUserRoleStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['user-roles'] });
      await queryClient.cancelQueries({ queryKey: ['user-role', id] });

      const previousRoles = queryClient.getQueriesData({
        queryKey: ['user-roles'],
      });
      const previousRole = queryClient.getQueryData<IUserRole>([
        'user-role',
        id,
      ]);

      // Detail cache only here; list cache shape is paginated and synced on success.
      queryClient.setQueryData<IUserRole | undefined>(
        ['user-role', id],
        currentRole =>
          currentRole ? { ...currentRole, isActive } : currentRole
      );

      return { previousRoles, previousRole };
    },
    onError: (_error, variables, context) => {
      context?.previousRoles.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      if (context?.previousRole) {
        queryClient.setQueryData(
          ['user-role', variables.id],
          context.previousRole
        );
      }

      toast.error(USER_ROLE_TEXTS.UPDATE_ERROR);
    },
    onSuccess: updatedRole => {
      if (updatedRole) {
        syncUserRoleCache(queryClient, updatedRole);
        toast.success(USER_ROLE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
  });

  return {
    ...mutation,
    updateUserRoleStatus: mutation.mutateAsync,
  };
};
