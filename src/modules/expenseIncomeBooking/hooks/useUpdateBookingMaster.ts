import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { expenseIncomeBookingApi } from '@/api/expenseIncomeBooking/expenseIncomeBooking.api';
import type { ICreateExpenseIncomeBookingMaster } from '../types/expenseIncomeBookingTypes';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

interface UpdateParams {
  id: string;
  data: Partial<ICreateExpenseIncomeBookingMaster>;
}

export const useUpdateBookingMaster = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateParams) =>
      expenseIncomeBookingApi.updateBookingMaster(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking-masters'] });
      queryClient.invalidateQueries({ queryKey: ['booking-master', variables.id] });
      toast.success('Booking Master updated successfully');
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Error updating booking master'));
    },
  });

  return {
    ...mutation,
    updateBookingMaster: mutation.mutateAsync,
  };
};
