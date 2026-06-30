import { apiClient } from '../api';
import { buildQueryString } from '@/utils';
import type {
  ICreateCurrencyProfile,
  ICurrencyProfile,
} from '@/modules/currencyProfile/types';

interface BackendCurrencyProfile extends Omit<ICurrencyProfile, 'countryId'> {
  countryId: string | null;
  country?: ICurrencyProfile['country'];
}

const mapBackendToFrontend = (
  currency: BackendCurrencyProfile
): ICurrencyProfile => ({
  ...currency,
  countryId: currency.countryId || '',
  country: currency.country ?? null,
});

export const currencyProfileApi = {
  getCurrencyProfiles: async (search?: string): Promise<ICurrencyProfile[]> => {
    const res = await apiClient.get<BackendCurrencyProfile[]>(
      `/currencies${buildQueryString({ search: search?.trim() || undefined })}`
    );
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },

  getCurrencyProfileById: async (
    id: string
  ): Promise<ICurrencyProfile | undefined> => {
    const res = await apiClient.get<BackendCurrencyProfile>(`/currencies/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createCurrencyProfile: async (
    data: ICreateCurrencyProfile
  ): Promise<ICurrencyProfile> => {
    const res = await apiClient.post<BackendCurrencyProfile>('/currencies', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create currency');
    return mapBackendToFrontend(res.data);
  },

  updateCurrencyProfile: async (
    id: string,
    data: ICreateCurrencyProfile
  ): Promise<ICurrencyProfile | undefined> => {
    const res = await apiClient.put<BackendCurrencyProfile>(
      `/currencies/${id}`,
      data
    );
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  deleteCurrencyProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/currencies/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
