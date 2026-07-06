import { useQuery } from '@tanstack/react-query';
import { chequebookApi, type IChequeBook } from '@/api';

export interface IChequeBookListQuery {
  branchId?: string;
  status?: string;
  bankAccountCode?: string;
  fromDate?: string;
  toDate?: string;
}

export const useListChequeBooks = (params?: IChequeBookListQuery) => {
  return useQuery<IChequeBook[]>({
    queryKey: ['cheque-books', params],
    queryFn: async () => {
      const data = await chequebookApi.findAll(
        params?.branchId,
        params?.status,
        params?.bankAccountCode,
        params?.fromDate,
        params?.toDate
      );
      return data;
    },
  });
};
