import { useQuery } from '@tanstack/react-query';
import { branchProfileApi } from '@/api/branchProfile';
import type { IBranchProfileListQuery } from '../types';

export const useListBranchProfiles = (options?: IBranchProfileListQuery) => {
  return useQuery({
    queryKey: ['branch-profiles', options],
    queryFn: () => branchProfileApi.getBranchProfiles(options),
  });
};
