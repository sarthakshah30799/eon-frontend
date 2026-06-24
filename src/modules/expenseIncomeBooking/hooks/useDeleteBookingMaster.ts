import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { expenseIncomeBookingApi } from '@/api/expenseIncomeBooking/expenseIncomeBooking.api';

export const useDeleteBookingMaster = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => expenseIncomeBookingApi.deleteBookingMaster(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-masters'] });
      toast.success('Booking Master deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error deleting booking master');
    },
  });

  return {
    ...mutation,
    deleteBookingMaster: mutation.mutateAsync,
  };
};
