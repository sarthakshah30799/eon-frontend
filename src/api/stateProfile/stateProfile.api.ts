import { apiClient } from '../api';
import type {
  IStateProfileListQuery,
  IStateProfileListResponse,
} from '@/modules/stateProfile/types';
import type {
  ICreateStateProfile,
  IStateProfile,
} from '@/modules/stateProfile/types';

const buildQueryString = (params?: IStateProfileListQuery) => {
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

export const stateProfileApi = {
  getStateProfiles: async (
    params?: IStateProfileListQuery
  ): Promise<IStateProfileListResponse> => {
    const res = await apiClient.get<IStateProfileListResponse>(
      `/states${buildQueryString(params)}`
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

  getStateProfileById: async (
    id: string
  ): Promise<IStateProfile | undefined> => {
    const res = await apiClient.get<IStateProfile>(`/states/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createStateProfile: async (
    values: ICreateStateProfile
  ): Promise<IStateProfile> => {
    const res = await apiClient.post<IStateProfile>('/states', {
      ...values,
      gstStateCode: values.gstStateCode || undefined,
      ctrStateCode: values.ctrStateCode || undefined,
    });
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create state');
    return res.data;
  },

  updateStateProfile: async (
    id: string,
    values: ICreateStateProfile
  ): Promise<IStateProfile | undefined> => {
    const res = await apiClient.put<IStateProfile>(`/states/${id}`, {
      ...values,
      gstStateCode: values.gstStateCode || undefined,
      ctrStateCode: values.ctrStateCode || undefined,
    });
    if (res.error) throw new Error(res.error);
    return res.data;
  },
};
