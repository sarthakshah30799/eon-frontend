import { useQuery } from '@tanstack/react-query';
import { documentProfileApi } from '@/api/documentProfile';
import type { IResolveDocumentProfileQuery } from '../types';

export const useResolveDocumentProfiles = (
  params?: IResolveDocumentProfileQuery
) =>
  useQuery({
    queryKey: ['document-profiles-resolve', params],
    queryFn: () => documentProfileApi.resolveDocumentProfiles(params),
  });

export default useResolveDocumentProfiles;
