import { apiClient } from '../api';
import type {
  IExpenseIncomeBookingMasterListQuery,
  ICreateExpenseIncomeBookingMaster,
  IExpenseIncomeBookingMaster,
} from '../../modules/expenseIncomeBooking/types/expenseIncomeBookingTypes';

const buildQueryString = (params?: IExpenseIncomeBookingMasterListQuery) => {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const expenseIncomeBookingApi = {
  getBookingMasters: async (
    params?: IExpenseIncomeBookingMasterListQuery
  ): Promise<IExpenseIncomeBookingMaster[]> => {
    // Note: The NestJS API returns an array directly
    const res = await apiClient.get<IExpenseIncomeBookingMaster[]>(
      `/expense-income-booking-masters${buildQueryString(params)}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getBookingMasterById: async (
    id: string
  ): Promise<IExpenseIncomeBookingMaster | undefined> => {
    const res = await apiClient.get<IExpenseIncomeBookingMaster>(
      `/expense-income-booking-masters/${id}`
    );
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createBookingMaster: async (
    values: ICreateExpenseIncomeBookingMaster
  ): Promise<IExpenseIncomeBookingMaster> => {
    const res = await apiClient.post<IExpenseIncomeBookingMaster>(
      '/expense-income-booking-masters',
      values
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create booking master');
    return res.data;
  },

  updateBookingMaster: async (
    id: string,
    values: Partial<ICreateExpenseIncomeBookingMaster>
  ): Promise<IExpenseIncomeBookingMaster | undefined> => {
    const res = await apiClient.put<IExpenseIncomeBookingMaster>(
      `/expense-income-booking-masters/${id}`,
      values
    );
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteBookingMaster: async (
    id: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(
      `/expense-income-booking-masters/${id}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete booking master');
    return res.data;
  },
};
