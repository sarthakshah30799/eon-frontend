import { apiClient } from '../api';
import type {
  IPolicyContext,
} from '@/modules/auth/types';
import type {
  ICountryAccessRule,
  ICreateMonthlyLocksPayload,
  ICreateCountryAccessRulesPayload,
  IMonthlyLockWindow,
} from '@/modules/transactionPolicies/types';

export const transactionPoliciesApi = {
  getPolicyContext: async (branchId?: string): Promise<IPolicyContext> => {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<IPolicyContext>(`/auth/policy-context${query}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to load policy context');
    }
    return res.data;
  },

  createCountryAccessRules: async (
    countryId: string,
    payload: ICreateCountryAccessRulesPayload,
  ): Promise<ICountryAccessRule[]> => {
    const res = await apiClient.post<ICountryAccessRule[]>(`/countries/${countryId}/unblock-access`, payload);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  listCountryAccessRules: async (
    countryId: string,
  ): Promise<ICountryAccessRule[]> => {
    const res = await apiClient.get<ICountryAccessRule[]>(`/countries/${countryId}/unblock-access`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  revokeCountryAccessRule: async (ruleId: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(
      `/countries/unblock-access/${ruleId}`,
    );
    if (res.error) throw new Error(res.error);
    return true;
  },

  createBackdateWindows: async (payload: ICreateMonthlyLocksPayload): Promise<IMonthlyLockWindow[]> => {
    const res = await apiClient.post<IMonthlyLockWindow[]>('/monthly-locks', payload);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  listBackdateWindows: async (): Promise<IMonthlyLockWindow[]> => {
    const res = await apiClient.get<IMonthlyLockWindow[]>('/monthly-locks');
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  revokeBackdateWindow: async (windowId: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(
      `/monthly-locks/${windowId}`,
    );
    if (res.error) throw new Error(res.error);
    return true;
  },

  completeDayEnd: async (
    payload: { branchId?: string; answers?: Record<string, unknown> },
  ): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(
      '/day-end-start-process/complete',
      payload,
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to complete day end');
    }
    return res.data;
  },

  startDay: async (
    payload: { branchId?: string; answers?: Record<string, unknown> },
  ): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(
      '/day-end-start-process/start',
      payload,
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      throw new Error('Failed to start day');
    }
    return res.data;
  },
};
