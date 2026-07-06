import { useQuery } from '@tanstack/react-query';
import { chequebookApi } from '@/api';

export interface IChequeBookCashier {
  id: string;
  name: string;
}

export const useListChequeBookCashiers = (branchId: string | null) => {
  return useQuery<IChequeBookCashier[]>({
    queryKey: ['cheque-book-cashiers', branchId],
    queryFn: async () => {
      if (!branchId) {
        return [];
      }

      return chequebookApi.getAuthorizedUsers(branchId);
    },
    enabled: Boolean(branchId),
  });
};
