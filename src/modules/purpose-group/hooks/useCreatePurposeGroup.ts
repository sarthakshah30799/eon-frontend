import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { purposeGroupApi } from '@/api/purpose-group';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';
import type { ICreatePurposeGroup } from '../types/purposeGroupTypes';

export const useCreatePurposeGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreatePurposeGroup) =>
      purposeGroupApi.createPurposeGroup(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purpose-groups'] });
      toast.success(PURPOSE_GROUP_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(PURPOSE_GROUP_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitPurposeGroup: mutation.mutateAsync,
  };
};
