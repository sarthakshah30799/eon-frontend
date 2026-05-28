import { useQuery } from '@tanstack/react-query';
import { branchProfileApi } from '@/api/branchProfile';

export const useGetBranchProfile = (id: string) => {
  return useQuery({
    queryKey: ['branch-profile', id],
    queryFn: () => branchProfileApi.getBranchProfileById(id),
    enabled: Boolean(id),
  });
};
