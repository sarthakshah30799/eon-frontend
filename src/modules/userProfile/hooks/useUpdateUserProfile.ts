import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userProfileApi } from '@/api/userProfile';
import type { ICreateUserProfile } from '../types';
import { USER_PROFILE_TEXTS } from '../constants';

interface UseUpdateUserProfileResult {
  submitUserProfile: (data: ICreateUserProfile) => Promise<unknown>;
  isPending: boolean;
}

export const useUpdateUserProfile = (id: string): UseUpdateUserProfileResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateUserProfile) =>
      userProfileApi.updateUserProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', id] });
      toast.success(USER_PROFILE_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(USER_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    submitUserProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

