import { useQuery } from '@tanstack/react-query';
import { passengersApi } from '@/api';

const OTHER_DOCUMENT_TYPES_QUERY_KEY = ['passenger-other-document-types'];

export const usePassengerOtherDocumentTypes = () =>
  useQuery({
    queryKey: OTHER_DOCUMENT_TYPES_QUERY_KEY,
    queryFn: () => passengersApi.getOtherDocumentTypes(),
    staleTime: 30 * 60 * 1000,
  });
