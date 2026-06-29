import { apiClient } from '../api';
import type {
  ICurrencyRateGroup,
  ICurrencyRateQuote,
  ICurrencyRateSettings,
  ICurrencyRate,
} from '@/modules/currencyRates/types/currencyRatesTypes';

export const currencyRatesApi = {
  getSettings: async (): Promise<ICurrencyRateSettings> => {
    const res = await apiClient.get<{ config: ICurrencyRateSettings }>('/currency-rates/settings');
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to load currency rate settings');
    return res.data.config;
  },

  saveSettings: async (config: ICurrencyRateSettings): Promise<ICurrencyRateSettings> => {
    const res = await apiClient.put<{ config: ICurrencyRateSettings }>('/currency-rates/settings', config);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to save currency rate settings');
    return res.data.config;
  },

  getGroups: async (): Promise<ICurrencyRateGroup[]> => {
    const res = await apiClient.get<ICurrencyRateGroup[]>('/currency-rates/groups');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createGroup: async (data: Partial<ICurrencyRateGroup> & { code: string; name: string }): Promise<ICurrencyRateGroup> => {
    const res = await apiClient.post<ICurrencyRateGroup>('/currency-rates/groups', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create currency rate group');
    return res.data;
  },

  updateGroup: async (id: string, data: Partial<ICurrencyRateGroup>): Promise<ICurrencyRateGroup> => {
    const res = await apiClient.put<ICurrencyRateGroup>(`/currency-rates/groups/${id}`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update currency rate group');
    return res.data;
  },

  createRateEntry: async (data: {
    currencyId: string;
    provider: ICurrencyRateQuote['provider'];
    baseRate?: string;
    baseBuyRate?: string;
    baseSaleRate?: string;
    isActive?: boolean;
    notes?: string;
  }): Promise<ICurrencyRate> => {
    const res = await apiClient.post<ICurrencyRate>('/currency-rates/rates', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create rate entry');
    return res.data;
  },

  getLatestRates: async (currencyId?: string): Promise<ICurrencyRate[]> => {
    const url = currencyId
      ? `/currency-rates/rates/latest?currencyId=${encodeURIComponent(currencyId)}`
      : '/currency-rates/rates/latest';
    const res = await apiClient.get<ICurrencyRate[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  preview: async (data: {
    currencyId: string;
    provider: ICurrencyRateQuote['provider'];
    baseBuyRate: string;
    baseSaleRate: string;
    notes?: string;
  }): Promise<ICurrencyRateQuote> => {
    const res = await apiClient.post<ICurrencyRateQuote>('/currency-rates/preview', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to preview rate');
    return res.data;
  },

  getContext: async (currencyId: string): Promise<{
    currencyId: string;
    currencyCode: string;
    pricingGroup: { id: string; code: string; name: string } | null;
    effectiveSource: string;
    hasOverride: boolean;
  }> => {
    const res = await apiClient.get<{
      currencyId: string;
      currencyCode: string;
      pricingGroup: { id: string; code: string; name: string } | null;
      effectiveSource: string;
      hasOverride: boolean;
    }>(`/currency-rates/context/${currencyId}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to load rate context');
    return res.data;
  },
};
