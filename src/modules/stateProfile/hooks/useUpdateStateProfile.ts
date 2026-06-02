import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { stateProfileApi } from '@/api/stateProfile';
import { STATE_PROFILE_TEXTS } from '../constants';
import type { ICreateStateProfile } from '../types';

export const useUpdateStateProfile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateStateProfile) =>
      stateProfileApi.updateStateProfile(id, data),
    onSuccess: updatedState => {
      if (updatedState) {
        queryClient.invalidateQueries({ queryKey: ['state-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['state-profile', id] });
        toast.success(STATE_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(STATE_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitStateProfile: mutation.mutateAsync,
  };
};

