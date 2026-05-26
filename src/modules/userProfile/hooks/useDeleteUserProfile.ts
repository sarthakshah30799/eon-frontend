import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userProfileApi } from '@/api/userProfile';
import { USER_PROFILE_TEXTS } from '../constants';

export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => userProfileApi.deleteUserProfile(id),
    onSuccess: deleted => {
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
        toast.success(USER_PROFILE_TEXTS.DELETE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(USER_PROFILE_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deleteUserProfile: mutation.mutateAsync,
  };
};

