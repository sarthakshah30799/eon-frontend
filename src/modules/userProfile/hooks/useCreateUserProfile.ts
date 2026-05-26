import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userProfileApi } from '@/api/userProfile';
import type { UserProfileFormValues } from '../types';
import { USER_PROFILE_TEXTS } from '../constants';

export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UserProfileFormValues) =>
      userProfileApi.createUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      toast.success(USER_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(USER_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitUserProfile: mutation.mutateAsync,
  };
};

