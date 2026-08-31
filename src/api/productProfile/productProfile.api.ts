import { apiClient } from '../api';
import type {
  ICreateProductProfile,
  IProductProfile,
  IProductProfileListQuery,
  IProductProfileListResponse,
  IUpdateProductProfilePayload,
} from '@/modules/productProfile/types';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

export const productProfileApi = {
  getProductProfiles: async (
    filter?: IProductProfileListQuery
  ): Promise<IProductProfileListResponse> => {
    const res = await apiClient.get<IProductProfileListResponse>(
      `/products${buildQueryString(filter)}`
    );
    if (res.error) {
      throw new Error(res.error);
    }
    return normalizePaginatedResponse(res.data, filter?.limit, filter?.offset);
  },

  getAllProductProfiles: async (
    filter?: Omit<IProductProfileListQuery, 'limit' | 'offset'>
  ): Promise<IProductProfile[]> =>
    fetchAllMatching(pagination =>
      productProfileApi.getProductProfiles({ ...filter, ...pagination })
    ),

  getProductProfileById: async (
    id: string
  ): Promise<IProductProfile | undefined> => {
    const res = await apiClient.get<IProductProfile>(`/products/${id}`);
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data;
  },

  createProductProfile: async (
    data: ICreateProductProfile
  ): Promise<IProductProfile> => {
    const res = await apiClient.post<IProductProfile>('/products', data);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('No product data returned from server');
    }
    return res.data;
  },

  updateProductProfile: async (
    id: string,
    data: IUpdateProductProfilePayload
  ): Promise<IProductProfile | undefined> => {
    const res = await apiClient.put<IProductProfile>(`/products/${id}`, data);
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data;
  },

  updateProductProfileStatus: async (
    id: string,
    isActiveProduct: boolean
  ): Promise<IProductProfile | undefined> => {
    const res = await apiClient.put<IProductProfile>(`/products/${id}`, {
      isActiveProduct,
    });
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data;
  },
};
