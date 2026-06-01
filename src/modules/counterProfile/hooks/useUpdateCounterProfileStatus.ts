import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { counterProfileApi } from '@/api/counterProfile';
import { COUNTER_PROFILE_TEXTS } from '../constants';

interface UpdateCounterProfileStatusPayload {
  id: string;
  isActive: boolean;
}

export const useUpdateCounterProfileStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, isActive }: UpdateCounterProfileStatusPayload) =>
      counterProfileApi.updateCounterProfileStatus(id, isActive),
    onSuccess: updatedCounter => {
      if (updatedCounter) {
        queryClient.invalidateQueries({ queryKey: ['counter-profiles'] });
        queryClient.invalidateQueries({
          queryKey: ['counter-profile', updatedCounter.id],
        });
        toast.success(COUNTER_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(COUNTER_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    updateCounterProfileStatus: mutation.mutateAsync,
  };
};
