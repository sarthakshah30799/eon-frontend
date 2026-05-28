import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { branchProfileApi } from '@/api/branchProfile';
import type { BranchProfileSavePayload } from '../types';
import { BRANCH_PROFILE_TEXTS } from '../constants';

interface UseUpdateBranchProfileResult {
  submitBranchProfile: (data: BranchProfileSavePayload) => Promise<unknown>;
  isPending: boolean;
}

export const useUpdateBranchProfile = (
  id: string
): UseUpdateBranchProfileResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BranchProfileSavePayload) =>
      branchProfileApi.updateBranchProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['branch-profile', id] });
      toast.success(BRANCH_PROFILE_TEXTS.UPDATE_SUCCESS);
    },
    onError: () => {
      toast.error(BRANCH_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    submitBranchProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
