import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transfersApi, type IRecordTransferPrintPayload } from '@/api/transfers/transfers.api';
import { getTransferHookErrorMessage } from '../utils/transferHooksUtils';

export const useRecordTransferPrint = () => {
  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IRecordTransferPrintPayload;
    }) => transfersApi.recordPrint(id, payload),
    onSuccess: () => {
      toast.success('Transfer copy sent to printer');
    },
    onError: (error: unknown) => {
      toast.error(getTransferHookErrorMessage(error, 'Failed to record transfer print'));
    },
  });

  return {
    ...mutation,
    recordTransferPrint: mutation.mutateAsync,
  };
};
