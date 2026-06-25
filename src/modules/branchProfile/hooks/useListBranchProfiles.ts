import { useQuery } from '@tanstack/react-query';
import { branchProfileApi } from '@/api/branchProfile';

export const useListBranchProfiles = (options?: {
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ['branch-profiles', options?.activeOnly === false],
    queryFn: () => branchProfileApi.getBranchProfiles(options),
  });
};
