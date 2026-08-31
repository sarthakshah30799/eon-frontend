import { apiClient } from '../api';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

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

export interface ICountryGroupListQuery extends IOffsetPaginationParams {
  search?: string;
}

export type ICountryGroupListResponse = IPaginatedResponse<ICountryGroup>;

export const countryGroupApi = {
  getCountryGroups: async (
    params?: ICountryGroupListQuery | string
  ): Promise<ICountryGroupListResponse> => {
    const queryObj: ICountryGroupListQuery | undefined =
      typeof params === 'string'
        ? { search: params.trim() || undefined }
        : params;
    const res = await apiClient.get<ICountryGroupListResponse>(
      `/country-groups${buildQueryString(queryObj)}`
    );
    if (res.error) throw new Error(res.error);
    return normalizePaginatedResponse(res.data, queryObj?.limit, queryObj?.offset);
  },

  getAllCountryGroups: async (
    params?: Omit<ICountryGroupListQuery, 'limit' | 'offset'> | string
  ): Promise<ICountryGroup[]> =>
    fetchAllMatching(pagination =>
      countryGroupApi.getCountryGroups(
        typeof params === 'string'
          ? { search: params.trim() || undefined, ...pagination }
          : { ...params, ...pagination }
      )
    ),

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
