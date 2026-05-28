import { useQuery } from '@tanstack/react-query';
import { branchProfileApi } from '@/api/branchProfile';

export const useListBranchProfiles = () => {
  return useQuery({
    queryKey: ['branch-profiles'],
    queryFn: branchProfileApi.getBranchProfiles,
  });
};
