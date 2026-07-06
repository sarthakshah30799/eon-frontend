import { useQuery } from '@tanstack/react-query';
import { manualBillBookApi } from '@/api';

export const useListManualBillBookManagers = (branchId?: string) => {
  return useQuery({
    queryKey: ['manual-bill-book-managers', branchId],
    queryFn: () => manualBillBookApi.getBranchManagers(branchId as string),
    enabled: Boolean(branchId),
  });
};
