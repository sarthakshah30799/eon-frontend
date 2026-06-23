import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { documentProfileApi } from '@/api/documentProfile';
import type { ICreateDocumentProfile } from '../types';
import { DOCUMENT_PROFILE_TEXTS } from '../constants/documentProfileConstants';

export const useCreateDocumentProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: ICreateDocumentProfile) =>
      documentProfileApi.createDocumentProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-profiles'] });
      toast.success(DOCUMENT_PROFILE_TEXTS.CREATE_SUCCESS);
    },
    onError: (error: Error) => {
      toast.error(error.message || DOCUMENT_PROFILE_TEXTS.CREATE_ERROR);
    },
  });

  return {
    createDocumentProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

