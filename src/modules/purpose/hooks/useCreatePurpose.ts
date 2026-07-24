import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { purposeApi } from '@/api/purpose';
import { PURPOSE_TEXTS } from '../constants/purposeConstants';
import type { ICreatePurpose } from '../types/purposeTypes';

export const useCreatePurpose = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreatePurpose) => purposeApi.createPurpose(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purposes'] });
      toast.success(PURPOSE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(PURPOSE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitPurpose: mutation.mutateAsync,
  };
};
