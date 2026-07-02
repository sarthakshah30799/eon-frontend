import { useQuery } from '@tanstack/react-query';
import { manualBillBookApi } from '@/api';

export const useListManualBillBooks = (branchId?: string) => {
  return useQuery({
    queryKey: ['manual-bill-books', branchId?.trim() || ''],
    queryFn: () => manualBillBookApi.findAll(branchId || undefined),
    enabled: Boolean(branchId),
  });
};

