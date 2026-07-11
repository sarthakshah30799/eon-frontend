import { useQuery } from '@tanstack/react-query';
import { manualBillBookApi, type IManualBook } from '@/api';

export interface IManualBillBookListQuery {
  branchId?: string;
  status?: string;
  transactionType?: string;
}

export const useListManualBillBooks = (params?: IManualBillBookListQuery) => {
  return useQuery<IManualBook[]>({
    queryKey: ['manual-bill-books', params],
    queryFn: async () => {
      return manualBillBookApi.findAll(
        params?.branchId,
        params?.status,
        params?.transactionType,
      );
    },
  });
};
