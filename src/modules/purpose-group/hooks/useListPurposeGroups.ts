import { useQuery } from '@tanstack/react-query';
import { purposeGroupApi } from '@/api/purpose-group';
import type { PurposeGroupProfileType } from '../types/purposeGroupTypes';

export const useListPurposeGroups = (
  search?: string,
  profileType?: PurposeGroupProfileType
) => {
  return useQuery({
    queryKey: ['purpose-groups', search?.trim() || '', profileType || ''],
    queryFn: () => purposeGroupApi.getPurposeGroups(search, profileType),
  });
};
