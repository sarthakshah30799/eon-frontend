import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transfersApi } from '@/api/transfers/transfers.api';
import { getTransferHookErrorMessage } from '../utils/transferHooksUtils';

export const useAcceptTransfer = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => transfersApi.acceptTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer'] });
      toast.success('Transfer accepted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getTransferHookErrorMessage(error, 'Failed to accept transfer'));
    },
  });

  return {
    ...mutation,
    acceptTransfer: mutation.mutateAsync,
  };
};

