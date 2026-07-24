import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { purposeApi } from '@/api/purpose';
import { PURPOSE_TEXTS } from '../constants/purposeConstants';

export const useDeletePurpose = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => purposeApi.deletePurpose(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purposes'] });
      toast.success(PURPOSE_TEXTS.DELETE_SUCCESS);
    },
    onError: () => {
      toast.error(PURPOSE_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deletePurpose: mutation.mutateAsync,
  };
};
