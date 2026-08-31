import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { tdsProfileApi } from '@/api/tdsProfile';
import type { ITdsProfileListQuery } from '../types';

export const useListTdsProfiles = (
  search?: ITdsProfileListQuery | string,
  enabled = true
) => {
  const params: ITdsProfileListQuery | undefined =
    typeof search === 'string' ? { search: search.trim() || undefined } : search;

  return useQuery({
    queryKey: ['tds-profiles', params],
    queryFn: () => tdsProfileApi.getTdsProfiles(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};
