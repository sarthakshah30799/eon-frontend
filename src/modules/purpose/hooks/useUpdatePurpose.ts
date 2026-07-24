import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { purposeApi } from '@/api/purpose';
import { PURPOSE_TEXTS } from '../constants/purposeConstants';
import type { ICreatePurpose } from '../types/purposeTypes';

export const useUpdatePurpose = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { id: string; data: ICreatePurpose }) =>
      purposeApi.updatePurpose(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purposes'] });
      toast.success(PURPOSE_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(PURPOSE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    updatePurpose: mutation.mutateAsync,
  };
};
