import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transfersApi, type ICreateTransferPayload } from '@/api/transfers/transfers.api';
import { getTransferHookErrorMessage } from '../utils/transferHooksUtils';

export const useCreateCounterTransfer = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: Omit<ICreateTransferPayload, 'transferType'>) =>
      transfersApi.createCounterTransfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success('Counter transfer created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getTransferHookErrorMessage(error, 'Failed to create counter transfer'));
    },
  });

  return {
    ...mutation,
    createCounterTransfer: mutation.mutateAsync,
  };
};

