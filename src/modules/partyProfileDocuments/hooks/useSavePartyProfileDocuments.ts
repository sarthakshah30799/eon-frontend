import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { partyProfileDocumentsApi } from '@/api/partyProfileDocuments';
import type { ISavePartyProfileDocumentsPayload } from '../types/partyProfileDocumentTypes';

export const useSavePartyProfileDocuments = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: ISavePartyProfileDocumentsPayload) => {
      for (const upload of payload.uploads) {
        await partyProfileDocumentsApi.uploadPartyProfileDocument({
          partyProfileId: payload.partyProfileId,
          documentProfileId: upload.documentProfileId,
          file: upload.file,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['party-profile-documents', variables.partyProfileId],
      });
      toast.success('Party profile documents saved successfully!');
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to save documents');
    },
  });

  return {
    ...mutation,
    savePartyProfileDocuments: mutation.mutateAsync,
  };
};

export default useSavePartyProfileDocuments;
