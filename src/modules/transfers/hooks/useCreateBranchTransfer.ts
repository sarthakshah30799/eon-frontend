import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transfersApi, type ICreateTransferPayload } from '@/api/transfers/transfers.api';
import { getTransferHookErrorMessage } from '../utils/transferHooksUtils';

export const useCreateBranchTransfer = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: Omit<ICreateTransferPayload, 'transferType'>) =>
      transfersApi.createBranchTransfer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success('Branch transfer created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getTransferHookErrorMessage(error, 'Failed to create branch transfer'));
    },
  });

  return {
    ...mutation,
    createBranchTransfer: mutation.mutateAsync,
  };
};

