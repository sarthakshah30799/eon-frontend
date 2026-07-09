import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transactionsApi } from '@/api/transactions';
import type { IPurchaseSubmitPayload } from '../types/purchaseTypes';

export const useCreatePurchaseTransaction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: IPurchaseSubmitPayload) =>
      transactionsApi.createDraft(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(
        variables.transaction.requiresApproval
          ? 'Transaction draft saved successfully'
          : `Transaction saved successfully with ${variables.transaction.number ?? 'generated reference'}`
      );
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save transaction'
      );
    },
  });

  return {
    ...mutation,
    createPurchaseTransaction: mutation.mutateAsync,
  };
};

export default useCreatePurchaseTransaction;
