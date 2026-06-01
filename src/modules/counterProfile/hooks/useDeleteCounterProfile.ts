import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { counterProfileApi } from '@/api/counterProfile';
import { COUNTER_PROFILE_TEXTS } from '../constants';

export const useDeleteCounterProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => counterProfileApi.deleteCounterProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counter-profiles'] });
      toast.success(COUNTER_PROFILE_TEXTS.DELETE_SUCCESS);
    },
    onError: () => {
      toast.error(COUNTER_PROFILE_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deleteCounterProfile: mutation.mutateAsync,
  };
};
