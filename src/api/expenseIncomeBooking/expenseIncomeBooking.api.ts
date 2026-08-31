import { apiClient } from '../api';
import type {
  IExpenseIncomeBookingMasterListQuery,
  IExpenseIncomeBookingMasterListResponse,
  ICreateExpenseIncomeBookingMaster,
  IExpenseIncomeBookingMaster,
} from '../../modules/expenseIncomeBooking/types/expenseIncomeBookingTypes';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

export const expenseIncomeBookingApi = {
  getBookingMasters: async (
    params?: IExpenseIncomeBookingMasterListQuery
  ): Promise<IExpenseIncomeBookingMasterListResponse> => {
    const res = await apiClient.get<IExpenseIncomeBookingMasterListResponse>(
      `/expense-income-booking-masters${buildQueryString(params)}`
    );
    if (res.error) throw new Error(res.error);
    return normalizePaginatedResponse(res.data, params?.limit, params?.offset);
  },

  getAllBookingMasters: async (
    params?: Omit<IExpenseIncomeBookingMasterListQuery, 'limit' | 'offset'>
  ): Promise<IExpenseIncomeBookingMaster[]> =>
    fetchAllMatching(pagination =>
      expenseIncomeBookingApi.getBookingMasters({ ...params, ...pagination })
    ),

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

  deleteBookingMaster: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(
      `/expense-income-booking-masters/${id}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete booking master');
    return res.data;
  },
};
