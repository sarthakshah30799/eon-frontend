import { useQuery } from '@tanstack/react-query';
import { documentProfileApi } from '@/api/documentProfile';

export const useGetDocumentProfile = (id?: string) => {
  return useQuery({
    queryKey: ['document-profile', id],
    queryFn: () => documentProfileApi.getDocumentProfileById(id as string),
    enabled: Boolean(id),
  });
};

