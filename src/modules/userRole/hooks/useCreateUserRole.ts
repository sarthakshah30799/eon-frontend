import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userRoleApi } from '@/api/userRole';
import type { ICreateUserRole } from '../types';
import { USER_ROLE_TEXTS } from '../constants';

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateUserRole) => userRoleApi.createUserRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success(USER_ROLE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(USER_ROLE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitUserRole: mutation.mutateAsync,
  };
};

