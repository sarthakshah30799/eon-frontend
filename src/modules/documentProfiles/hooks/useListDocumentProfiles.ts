import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { documentProfileApi } from '@/api/documentProfile';
import type { IDocumentProfileListQuery } from '../types';

export const useListDocumentProfiles = (
  params?: IDocumentProfileListQuery,
  enabled = true
) => {
  return useQuery({
    queryKey: ['document-profiles', params],
    queryFn: () => documentProfileApi.getDocumentProfiles(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};
