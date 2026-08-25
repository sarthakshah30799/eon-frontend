import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { purposeGroupApi } from '@/api/purpose-group';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';
import type { ICreatePurposeGroup } from '../types/purposeGroupTypes';

export const useUpdatePurposeGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { id: string; data: ICreatePurposeGroup }) =>
      purposeGroupApi.updatePurposeGroup(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purpose-groups'] });
      toast.success(PURPOSE_GROUP_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(PURPOSE_GROUP_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    ...mutation,
    updatePurposeGroup: mutation.mutateAsync,
  };
};
