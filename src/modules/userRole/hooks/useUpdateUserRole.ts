import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userRoleApi } from '@/api/userRole';
import type { UserRoleFormValues } from '../types';
import { USER_ROLE_TEXTS } from '../constants';

export const useUpdateUserRole = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UserRoleFormValues) => userRoleApi.updateUserRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-role', id] });
      toast.success(USER_ROLE_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(USER_ROLE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitUserRole: mutation.mutateAsync,
  };
};

