import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userRoleApi } from '@/api/userRole';
import { USER_ROLE_TEXTS } from '../constants';
import { syncUserRoleCache } from '../utils';

export const useUpdateUserRoleStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => userRoleApi.updateUserRoleStatus(id, isActive),
    onSuccess: updatedRole => {
      if (updatedRole) {
        syncUserRoleCache(queryClient, updatedRole);
        toast.success(USER_ROLE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(USER_ROLE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    updateUserRoleStatus: mutation.mutateAsync,
  };
};
