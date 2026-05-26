import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userRoleApi } from '@/api/userRole';
import { USER_ROLE_TEXTS } from '../constants';

export const useDeleteUserRole = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => userRoleApi.deleteUserRole(id),
    onSuccess: deleted => {
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: ['user-roles'] });
        toast.success(USER_ROLE_TEXTS.DELETE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(USER_ROLE_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deleteUserRole: mutation.mutateAsync,
  };
};

