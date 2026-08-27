import { apiClient } from '../api';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';

export interface ICountryGroupCurrency {
  id: string;
  currencyCode: string;
  currencyName: string;
}

export interface ICountryGroup {
  id: string;
  name: string;
  code: string;
  sellLimitAmount: string | null;
  sellLimitCurrencyId: string | null;
  sellLimitCurrency?: ICountryGroupCurrency | null;
  minTravelDays: number | null;
  maxTravelDays: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateCountryGroup {
  name: string;
  code: string;
  sellLimitAmount: number | null;
  sellLimitCurrencyId: string | null;
  minTravelDays: number | null;
  maxTravelDays: number | null;
}

export type IUpdateCountryGroup = Partial<ICreateCountryGroup>;

export interface ICountryGroupFormValues {
  name: string;
  code: string;
  sellLimitAmount: string;
  sellLimitCurrencyId: string;
  minTravelDays: string;
  maxTravelDays: string;
}

export type ICountryGroupCurrencyProfile = Pick<
  ICurrencyProfile,
  'id' | 'currencyCode' | 'currencyName'
>;

export const countryGroupApi = {
  getCountryGroups: async (search?: string): Promise<ICountryGroup[]> => {
    const params = search?.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : '';
    const res = await apiClient.get<ICountryGroup[]>(
      `/country-groups${params}`
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  getCountryGroupById: async (
    id: string
  ): Promise<ICountryGroup | undefined> => {
    const res = await apiClient.get<ICountryGroup>(`/country-groups/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createCountryGroup: async (
    values: ICreateCountryGroup
  ): Promise<ICountryGroup> => {
    const res = await apiClient.post<ICountryGroup>('/country-groups', values);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create country group');
    return res.data;
  },

  updateCountryGroup: async (
    id: string,
    values: IUpdateCountryGroup
  ): Promise<ICountryGroup | undefined> => {
    const res = await apiClient.put<ICountryGroup>(
      `/country-groups/${id}`,
      values
    );
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteCountryGroup: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(
      `/country-groups/${id}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete country group');
    return res.data;
  },
};
