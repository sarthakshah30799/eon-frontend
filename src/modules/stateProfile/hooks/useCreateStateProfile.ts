import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { stateProfileApi } from '@/api/stateProfile';
import { STATE_PROFILE_TEXTS } from '../constants';
import type { ICreateStateProfile } from '../types';

export const useCreateStateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateStateProfile) =>
      stateProfileApi.createStateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['state-profiles'] });
      toast.success(STATE_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(STATE_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitStateProfile: mutation.mutateAsync,
  };
};

