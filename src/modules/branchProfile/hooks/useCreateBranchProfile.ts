import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { branchProfileApi } from '@/api/branchProfile';
import type { BranchProfileFormValues } from '../types';
import { BRANCH_PROFILE_TEXTS } from '../constants';

export const useCreateBranchProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BranchProfileFormValues) =>
      branchProfileApi.createBranchProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-profiles'] });
      toast.success(BRANCH_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: () => {
      toast.error(BRANCH_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    ...mutation,
    submitBranchProfile: mutation.mutateAsync,
  };
};
