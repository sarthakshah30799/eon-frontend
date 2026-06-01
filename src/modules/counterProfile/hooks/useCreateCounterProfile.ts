import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { counterProfileApi } from '@/api/counterProfile';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import type { CounterProfileFormValues } from '../types';

export const useCreateCounterProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CounterProfileFormValues) =>
      counterProfileApi.createCounterProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counter-profiles'] });
      toast.success(COUNTER_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(COUNTER_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitCounterProfile: mutation.mutateAsync,
  };
};
