import { apiClient } from '../api';
import {
  DEFAULT_PARTY_PROFILE_TYPE,
  getPartyProfileTypeConfig,
  type PartyProfileType,
} from '@/modules/partyProfiles/constants';
import type {
  IPartyProfile,
  IPartyProfileListQuery,
  IPartyProfileListResponse,
  ICreatePartyProfile,
  IUpdatePartyProfile,
} from '@/modules/partyProfiles/types/partyProfileTypes';

const buildQueryString = (params?: IPartyProfileListQuery) => {
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

const getProfileEndpoint = (profileType?: PartyProfileType) =>
  getPartyProfileTypeConfig(profileType).endpoint;

export const partyProfileApi = {
  getPartyProfiles: async (
    params?: IPartyProfileListQuery,
    profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
  ): Promise<IPartyProfileListResponse> => {
    const res = await apiClient.get<IPartyProfileListResponse>(
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

  getPartyProfileById: async (
    id: string,
    profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
  ): Promise<IPartyProfile | undefined> => {
    const res = await apiClient.get<IPartyProfile>(
      `${getProfileEndpoint(profileType)}/${id}`
    );
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createPartyProfile: async (
    values: ICreatePartyProfile,
    profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
  ): Promise<IPartyProfile> => {
    const res = await apiClient.post<IPartyProfile>(
      getProfileEndpoint(profileType),
      values
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create party profile');
    return res.data;
  },

  updatePartyProfile: async (
    id: string,
    values: IUpdatePartyProfile,
    profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
  ): Promise<IPartyProfile | undefined> => {
    const res = await apiClient.put<IPartyProfile>(
      `${getProfileEndpoint(profileType)}/${id}`,
      values
    );
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deletePartyProfile: async (
    id: string,
    profileType: PartyProfileType = DEFAULT_PARTY_PROFILE_TYPE
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(
      `${getProfileEndpoint(profileType)}/${id}`
    );
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete party profile');
    return res.data;
  },

  getPartyProfileTypes: async (): Promise<{ value: string; label: string }[]> => {
    const res = await apiClient.get<{ value: string; label: string }[]>(
      '/party-profiles/types'
    );
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
};

export default partyProfileApi;
