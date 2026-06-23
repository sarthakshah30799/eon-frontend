import { useQuery } from '@tanstack/react-query';
import { documentProfileApi } from '@/api/documentProfile';
import type { IDocumentProfileListQuery } from '../types';

export const useListDocumentProfiles = (params?: IDocumentProfileListQuery) => {
  return useQuery({
    queryKey: ['document-profiles', params],
    queryFn: () => documentProfileApi.getDocumentProfiles(params),
  });
};

