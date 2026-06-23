import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { documentProfileApi } from '@/api/documentProfile';
import type { ICreateDocumentProfile } from '../types';
import { DOCUMENT_PROFILE_TEXTS } from '../constants/documentProfileConstants';

export const useUpdateDocumentProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ICreateDocumentProfile }) =>
      documentProfileApi.updateDocumentProfile(id, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['document-profile', variables.id] });
      toast.success(DOCUMENT_PROFILE_TEXTS.UPDATE_SUCCESS);
    },
    onError: (error: Error) => {
      toast.error(error.message || DOCUMENT_PROFILE_TEXTS.UPDATE_ERROR);
    },
  });

  return {
    updateDocumentProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

