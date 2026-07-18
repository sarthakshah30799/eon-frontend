import { useQuery } from '@tanstack/react-query';
import { branchProfileApi } from '@/api/branchProfile';
import type { IBranchProfileListQuery } from '../types';

export const useListBranchProfiles = (
  options?: IBranchProfileListQuery,
  enabled = true,
) => {
  const activeOnly = options?.activeOnly !== false;
  return useQuery({
    queryKey: ['branch-profiles', options, activeOnly],
    queryFn: () => branchProfileApi.getBranchProfiles(options),
    enabled,
    select: branches =>
      activeOnly
        ? branches.filter(branch => branch.isActive !== false)
        : branches,
  });
};
