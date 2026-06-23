import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { documentProfileApi } from '@/api/documentProfile';
import { DOCUMENT_PROFILE_TEXTS } from '../constants/documentProfileConstants';

export const useDeleteDocumentProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => documentProfileApi.deleteDocumentProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-profiles'] });
      toast.success(DOCUMENT_PROFILE_TEXTS.DELETE_SUCCESS);
    },
    onError: (error: Error) => {
      toast.error(error.message || DOCUMENT_PROFILE_TEXTS.DELETE_ERROR);
    },
  });

  return {
    deleteDocumentProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

