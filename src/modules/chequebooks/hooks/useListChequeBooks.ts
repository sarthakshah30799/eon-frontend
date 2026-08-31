import { useQuery } from '@tanstack/react-query';
import {
  chequebookApi,
  type IChequeBook,
  type IChequeBookListQuery,
} from '@/api';

export type { IChequeBookListQuery };

export const useListChequeBooks = (
  params?: Omit<IChequeBookListQuery, 'limit' | 'offset'>
) => {
  return useQuery<IChequeBook[]>({
    queryKey: ['cheque-books', 'all', params],
    queryFn: async () => chequebookApi.findAllMatching(params),
  });
};
