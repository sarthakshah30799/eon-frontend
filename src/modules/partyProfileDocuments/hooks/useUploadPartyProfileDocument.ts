import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { partyProfileDocumentsApi } from '@/api/partyProfileDocuments';

export const useUploadPartyProfileDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: partyProfileDocumentsApi.uploadPartyProfileDocument,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['party-profile-documents', variables.partyProfileId],
      });
      toast.success('Document uploaded successfully!');
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    },
  });

  return {
    ...mutation,
    uploadPartyProfileDocument: mutation.mutateAsync,
  };
};
