import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { purposeGroupApi } from '@/api/purpose-group';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';

export const useDeletePurposeGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => purposeGroupApi.deletePurposeGroup(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purpose-groups'] });
      toast.success(PURPOSE_GROUP_TEXTS.DELETE_SUCCESS);
    },
    onError: () => {
      toast.error(PURPOSE_GROUP_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deletePurposeGroup: mutation.mutateAsync,
  };
};
