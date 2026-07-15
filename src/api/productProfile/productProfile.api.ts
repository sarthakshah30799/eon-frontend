import { apiClient } from '../api';
import type {
  ICreateProductProfile,
  IProductProfile,
} from '@/modules/productProfile/types';

export const productProfileApi = {
  getProductProfiles: async (filter?: { bulkBuying?: boolean; bulkSelling?: boolean }): Promise<IProductProfile[]> => {
    const params = new URLSearchParams();
    if (filter?.bulkBuying) params.set('bulkBuying', 'true');
    if (filter?.bulkSelling) params.set('bulkSelling', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<IProductProfile[]>(`/products${query}`);
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data || [];
  },

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
    data: ICreateProductProfile
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
