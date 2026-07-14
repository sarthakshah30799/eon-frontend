import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { counterProfileApi } from '@/api/counterProfile';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import type { ICounterProfile } from '../types';
import { syncCounterProfileCache } from '../utils';

interface UpdateCounterProfileStatusPayload {
  id: string;
  isActive: boolean;
}

export const useUpdateCounterProfileStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, isActive }: UpdateCounterProfileStatusPayload) =>
      counterProfileApi.updateCounterProfileStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['counter-profiles'] });
      await queryClient.cancelQueries({ queryKey: ['counter-profile', id] });

      const previousCounters = queryClient.getQueriesData<ICounterProfile[]>({
        queryKey: ['counter-profiles'],
      });
      const previousCounter = queryClient.getQueryData<ICounterProfile>([
        'counter-profile',
        id,
      ]);

      queryClient.setQueriesData<ICounterProfile[]>(
        { queryKey: ['counter-profiles'] },
        currentCounters =>
          currentCounters?.map(counter =>
            counter.id === id ? { ...counter, isActive } : counter
          ) ?? currentCounters
      );

      queryClient.setQueryData<ICounterProfile | undefined>(
        ['counter-profile', id],
        currentCounter =>
          currentCounter ? { ...currentCounter, isActive } : currentCounter
      );

      return { previousCounters, previousCounter };
    },
    onError: (_error, variables, context) => {
      context?.previousCounters.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      if (context?.previousCounter) {
        queryClient.setQueryData(['counter-profile', variables.id], context.previousCounter);
      }

      toast.error(COUNTER_PROFILE_TEXTS.UPDATE_ERROR);
    },
    onSuccess: updatedCounter => {
      if (updatedCounter) {
        syncCounterProfileCache(queryClient, updatedCounter);
        toast.success(COUNTER_PROFILE_TEXTS.UPDATE_SUCCESS);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['counter-profiles'] });
    },
  });

  return {
    ...mutation,
    updateCounterProfileStatus: mutation.mutateAsync,
  };
};
