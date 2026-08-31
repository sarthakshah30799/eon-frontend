import { apiClient } from '../api';
import { buildQueryString } from '@/utils';
import type {
  ICreateCurrencyProfile,
  ICurrencyProfile,
  ICurrencyProfileListQuery,
  ICurrencyProfileListResponse,
} from '@/modules/currencyProfile/types';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

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

const normalizeListQuery = (
  options?:
    | string
    | Omit<ICurrencyProfileListQuery, 'limit' | 'offset'>
): ICurrencyProfileListQuery | undefined =>
  typeof options === 'string' ? { search: options || undefined } : options;

export const currencyProfileApi = {
  getCurrencyProfiles: async (
    options?: ICurrencyProfileListQuery | string
  ): Promise<ICurrencyProfileListResponse> => {
    const queryObj = normalizeListQuery(options);
    const res = await apiClient.get<ICurrencyProfileListResponse>(
      `/currencies${buildQueryString(queryObj)}`
    );
    if (res.error) throw new Error(res.error);
    const payload = normalizePaginatedResponse(
      res.data
        ? {
            ...res.data,
            data: (res.data.data || []).map(mapBackendToFrontend),
          }
        : res.data,
      queryObj?.limit,
      queryObj?.offset
    );
    return payload;
  },

  getAllCurrencyProfiles: async (
    options?: Omit<ICurrencyProfileListQuery, 'limit' | 'offset'> | string
  ): Promise<ICurrencyProfile[]> =>
    fetchAllMatching(pagination =>
      currencyProfileApi.getCurrencyProfiles({ ...normalizeListQuery(options), ...pagination })
    ),

  getCurrencyProfileById: async (
    id: string
  ): Promise<ICurrencyProfile | undefined> => {
    const res = await apiClient.get<BackendCurrencyProfile>(
      `/currencies/${id}`
    );
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createCurrencyProfile: async (
    data: ICreateCurrencyProfile
  ): Promise<ICurrencyProfile> => {
    const res = await apiClient.post<BackendCurrencyProfile>(
      '/currencies',
      data
    );
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
    const res = await apiClient.delete<{ message: string }>(
      `/currencies/${id}`
    );
    if (res.error) throw new Error(res.error);
    return true;
  },
};
