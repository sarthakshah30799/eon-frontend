import { apiClient } from '../api';
import type {
  IDocumentProfile,
  IDocumentProfileListQuery,
  ICreateDocumentProfile,
  IResolveDocumentProfileQuery,
} from '@/modules/documentProfiles/types';

const buildQueryString = (
  params?: IDocumentProfileListQuery | IResolveDocumentProfileQuery
) => {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const documentProfileApi = {
  getDocumentProfiles: async (
    params?: IDocumentProfileListQuery
  ): Promise<IDocumentProfile[]> => {
    const res = await apiClient.get<IDocumentProfile[]>(
      `/document-profiles${buildQueryString(params)}`
    );

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data || [];
  },

  getDocumentProfileById: async (
    id: string
  ): Promise<IDocumentProfile | undefined> => {
    const res = await apiClient.get<IDocumentProfile>(`/document-profiles/${id}`);

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data;
  },

  createDocumentProfile: async (
    data: ICreateDocumentProfile
  ): Promise<IDocumentProfile> => {
    const res = await apiClient.post<IDocumentProfile>('/document-profiles', data);

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('No document profile returned from server');
    }

    return res.data;
  },

  updateDocumentProfile: async (
    id: string,
    data: ICreateDocumentProfile
  ): Promise<IDocumentProfile | undefined> => {
    const res = await apiClient.put<IDocumentProfile>(
      `/document-profiles/${id}`,
      data
    );

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data;
  },

  deleteDocumentProfile: async (
    id: string
  ): Promise<{ message: string } | undefined> => {
    const res = await apiClient.delete<{ message: string }>(
      `/document-profiles/${id}`
    );

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data;
  },

  resolveDocumentProfiles: async (
    params?: IResolveDocumentProfileQuery
  ): Promise<IDocumentProfile[]> => {
    const res = await apiClient.get<IDocumentProfile[]>(
      `/document-profiles/resolve${buildQueryString(params)}`
    );

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data || [];
  },
};
