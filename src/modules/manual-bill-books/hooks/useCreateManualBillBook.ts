import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { manualBillBookApi, type ICreateManualBook } from '@/api';
import type { IBulkDispatchFormValues } from '../types';

const toCreateManualBookPayload = (
  values: IBulkDispatchFormValues
): ICreateManualBook => ({
  dispatchDate: values.dispatchDate,
  transactionType: values.transactionType,
  bookNoFrom: Number(values.bookNoFrom),
  bookNoTo: Number(values.bookNoTo),
  vouchersPerBook: Number(values.vouchersPerBook),
  mvNoFrom: Number(values.mvNoFrom),
  assignedTo: values.assignedTo,
  remarks: values.remarks,
});

export const useCreateManualBillBook = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: IBulkDispatchFormValues) =>
      manualBillBookApi.create(toCreateManualBookPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-bill-books'] });
      toast.success('Manual bill book record saved successfully.');
    },
    onError: () => {
      toast.error('Failed to save manual bill book.');
    },
  });

  return {
    ...mutation,
    submitManualBillBook: mutation.mutateAsync,
  };
};
