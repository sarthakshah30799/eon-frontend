import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  transfersApi,
  type IRecordTransferPrintPayload,
} from '@/api/transfers/transfers.api';

export const useRecordTransferPrint = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IRecordTransferPrintPayload;
    }) => transfersApi.recordPrint(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['transfer', variables.id],
      });
      void queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });

  return {
    ...mutation,
    recordTransferPrint: mutation.mutateAsync,
  };
};
