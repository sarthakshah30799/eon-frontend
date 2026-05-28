import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { branchProfileApi } from '@/api/branchProfile';
import { BRANCH_PROFILE_TEXTS } from '../constants';

export const useDeleteBranchProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => branchProfileApi.deleteBranchProfile(id),
    onSuccess: deleted => {
      if (deleted) {
        queryClient.invalidateQueries({ queryKey: ['branch-profiles'] });
        toast.success(BRANCH_PROFILE_TEXTS.DELETE_SUCCESS);
      }
    },
    onError: () => {
      toast.error(BRANCH_PROFILE_TEXTS.DELETE_ERROR);
    },
  });

  return {
    ...mutation,
    deleteBranchProfile: mutation.mutateAsync,
  };
};
