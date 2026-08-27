import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { manualBillBookApi } from '@/api';
import type { IManualBillBookListResponse } from '@/api/manual-bill-books/manualBillBook.api';

// Re-export API query type for convenience (includes limit/offset)
export type IManualBillBookListQuery = {
  branchId?: string;
  status?: string;
  transactionType?: string;
  limit?: number;
  offset?: number;
};

export const useListManualBillBooks = (params?: IManualBillBookListQuery) => {
  return useQuery<IManualBillBookListResponse>({
    queryKey: ['manual-bill-books', params],
    queryFn: async () => {
      return manualBillBookApi.findAll(params);
    },
    placeholderData: keepPreviousData,
  });
};
