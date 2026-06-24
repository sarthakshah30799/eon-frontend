import { useQuery } from '@tanstack/react-query';
import { expenseIncomeBookingApi } from '@/api/expenseIncomeBooking/expenseIncomeBooking.api';

export const useGetBookingMaster = (id?: string) => {
  return useQuery({
    queryKey: ['booking-master', id],
    queryFn: () => {
      if (!id) throw new Error('ID is required');
      return expenseIncomeBookingApi.getBookingMasterById(id);
    },
    enabled: Boolean(id),
  });
};
