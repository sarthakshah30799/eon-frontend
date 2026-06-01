import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { counterProfileApi } from '@/api/counterProfile';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import type { CounterProfileFormValues } from '../types';

export const useUpdateCounterProfile = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CounterProfileFormValues) =>
      counterProfileApi.updateCounterProfile(id, data),
    onSuccess: updatedCounter => {
      if (updatedCounter) {
        queryClient.invalidateQueries({ queryKey: ['counter-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['counter-profile', id] });
        toast.success(COUNTER_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(COUNTER_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCounterProfile: mutation.mutateAsync,
  };
};
