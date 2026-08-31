import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transfersApi } from '@/api/transfers/transfers.api';
import { getTransferHookErrorMessage } from '../utils/transferHooksUtils';

export const useRejectTransfer = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string | null }) =>
      transfersApi.rejectTransfer(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer'] });
      toast.success('Transfer rejected successfully');
    },
    onError: (error: unknown) => {
      toast.error(
        getTransferHookErrorMessage(error, 'Failed to reject transfer')
      );
    },
  });

  return {
    ...mutation,
    rejectTransfer: mutation.mutateAsync,
  };
};
