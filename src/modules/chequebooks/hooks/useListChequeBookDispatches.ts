import { useQuery } from '@tanstack/react-query';
import { chequebookApi, type IChequeBook } from '@/api';

export const useListChequeBookDispatches = (activeBranchId: string | null) => {
  return useQuery<IChequeBook[]>({
    queryKey: ['cheque-book-dispatches', activeBranchId],
    queryFn: async () => {
      if (!activeBranchId) {
        return [];
      }

      return chequebookApi.findAll(activeBranchId);
    },
    enabled: Boolean(activeBranchId),
  });
};
