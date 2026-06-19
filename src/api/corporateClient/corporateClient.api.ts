import { apiClient } from '../api';
import {
  DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE,
  getCorporateClientProfileTypeConfig,
  type CorporateClientProfileType,
} from '@/modules/corporateClient/constants';
import type {
  ICorporateClient,
  ICorporateClientListQuery,
  ICorporateClientListResponse,
  ICreateCorporateClient,
  IUpdateCorporateClient,
} from '@/modules/corporateClient/types/corporateClientTypes';

const buildQueryString = (params?: ICorporateClientListQuery) => {
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

const getProfileEndpoint = (profileType?: CorporateClientProfileType) =>
  getCorporateClientProfileTypeConfig(profileType).endpoint;

export const corporateClientApi = {
  getCorporateClients: async (
    params?: ICorporateClientListQuery,
    profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
  ): Promise<ICorporateClientListResponse> => {
    const res = await apiClient.get<ICorporateClientListResponse>(
      `${getProfileEndpoint(profileType)}${buildQueryString(params)}`
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

  getCorporateClientById: async (
    id: string,
    profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
  ): Promise<ICorporateClient | undefined> => {
    const res = await apiClient.get<ICorporateClient>(
      `${getProfileEndpoint(profileType)}/${id}`
    );
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createCorporateClient: async (
    values: ICreateCorporateClient,
    profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
  ): Promise<ICorporateClient> => {
    const res = await apiClient.post<ICorporateClient>(
      getProfileEndpoint(profileType),
      values
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create corporate client');
    return res.data;
  },

  updateCorporateClient: async (
    id: string,
    values: IUpdateCorporateClient,
    profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
  ): Promise<ICorporateClient | undefined> => {
    const res = await apiClient.put<ICorporateClient>(
      `${getProfileEndpoint(profileType)}/${id}`,
      values
    );
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteCorporateClient: async (
    id: string,
    profileType: CorporateClientProfileType = DEFAULT_CORPORATE_CLIENT_PROFILE_TYPE
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(
      `${getProfileEndpoint(profileType)}/${id}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete corporate client');
    return res.data;
  },
};

export default corporateClientApi;
