import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { expenseIncomeBookingApi } from '@/api/expenseIncomeBooking/expenseIncomeBooking.api';
import type { IExpenseIncomeBookingMasterListQuery } from '../types/expenseIncomeBookingTypes';

interface UseListBookingMastersParams extends IExpenseIncomeBookingMasterListQuery {
  enabled?: boolean;
}

export const useListBookingMasters = (params?: UseListBookingMastersParams) => {
  const { enabled = true, ...queryParams } = params ?? {};

  return useQuery({
    queryKey: ['booking-masters', queryParams],
    queryFn: () => expenseIncomeBookingApi.getBookingMasters(queryParams),
    placeholderData: keepPreviousData,
    enabled,
  });
};
