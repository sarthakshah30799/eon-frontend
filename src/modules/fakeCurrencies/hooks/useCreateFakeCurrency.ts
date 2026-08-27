import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transactionsApi } from '@/api/transactions';
import type { ICreateTransactionDraftPayload } from '@/modules/transactions';

export const useCreateFakeCurrency = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: ICreateTransactionDraftPayload) =>
      transactionsApi.createDraft(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Fake currency transaction saved successfully');
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save fake currency transaction'
      );
    },
  });

  return { ...mutation, createFakeCurrency: mutation.mutateAsync };
};

export default useCreateFakeCurrency;
