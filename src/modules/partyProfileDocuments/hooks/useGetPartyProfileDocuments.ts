import { useQuery } from '@tanstack/react-query';
import { partyProfileDocumentsApi } from '@/api/partyProfileDocuments';

export const useGetPartyProfileDocuments = (partyProfileId: string, enabled = true) => {
  return useQuery({
    queryKey: ['party-profile-documents', partyProfileId],
    queryFn: () => partyProfileDocumentsApi.getPartyProfileDocuments(partyProfileId),
    enabled: Boolean(partyProfileId) && enabled,
  });
};
