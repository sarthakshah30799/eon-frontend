import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { expenseIncomeBookingApi } from '@/api/expenseIncomeBooking/expenseIncomeBooking.api';
import type { ICreateExpenseIncomeBookingMaster } from '../types/expenseIncomeBookingTypes';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useCreateBookingMaster = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ICreateExpenseIncomeBookingMaster) =>
      expenseIncomeBookingApi.createBookingMaster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-masters'] });
      toast.success('Booking Master created successfully');
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Error creating booking master'));
    },
  });

  return {
    ...mutation,
    submitBookingMaster: mutation.mutateAsync,
  };
};
