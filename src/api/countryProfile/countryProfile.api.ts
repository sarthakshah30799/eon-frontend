import { apiClient } from '../api';
import type {
  ICountryProfileListQuery,
  ICountryProfileListResponse,
} from '@/modules/countryProfile/types';
import type {
  ICreateCountryProfile,
  ICountryProfile,
} from '@/modules/countryProfile/types';

const buildQueryString = (params?: ICountryProfileListQuery) => {
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

export const countryProfileApi = {
  getCountryProfiles: async (
    params?: ICountryProfileListQuery
  ): Promise<ICountryProfileListResponse> => {
    const res = await apiClient.get<ICountryProfileListResponse>(
      `/countries${buildQueryString(params)}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) {
      return {
        data: [],
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalItems: 0,
        totalPages: 0,
      };
    }

    return {
      ...res.data,
      data: res.data.data || [],
    };
  },

  getCountryProfileById: async (
    id: string
  ): Promise<ICountryProfile | undefined> => {
    const res = await apiClient.get<ICountryProfile>(`/countries/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createCountryProfile: async (
    values: ICreateCountryProfile
  ): Promise<ICountryProfile> => {
    const res = await apiClient.post<ICountryProfile>('/countries', {
      ...values,
      lrsCountryCode: values.lrsCountryCode || undefined,
      ctrCountryCode: values.ctrCountryCode || undefined,
    });
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create country');
    return res.data;
  },

  updateCountryProfile: async (
    id: string,
    values: ICreateCountryProfile
  ): Promise<ICountryProfile | undefined> => {
    const res = await apiClient.put<ICountryProfile>(`/countries/${id}`, {
      ...values,
      lrsCountryCode: values.lrsCountryCode || undefined,
      ctrCountryCode: values.ctrCountryCode || undefined,
    });
    if (res.error) throw new Error(res.error);
    return res.data;
  },
};
