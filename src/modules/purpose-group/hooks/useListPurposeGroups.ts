import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { purposeGroupApi } from '@/api/purpose-group';
import type { IPurposeGroupListQuery, PurposeGroupProfileType } from '../types/purposeGroupTypes';

export const useListPurposeGroups = (
  search?: IPurposeGroupListQuery | string,
  profileType?: PurposeGroupProfileType,
  enabled = true
) => {
  const params: IPurposeGroupListQuery | undefined =
    typeof search === 'string'
      ? { search: search.trim() || undefined, profileType }
      : search;

  return useQuery({
    queryKey: [
      'purpose-groups',
      params?.search?.trim() || '',
      params?.profileType || profileType || '',
      params?.limit,
      params?.offset,
    ],
    queryFn: () =>
      typeof search === 'string'
        ? purposeGroupApi.getPurposeGroups(search, profileType)
        : purposeGroupApi.getPurposeGroups(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};
