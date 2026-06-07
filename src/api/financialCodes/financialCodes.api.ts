import { apiClient } from '../api';
import type {
  IFinancialCode,
  IFinancialCodeListQuery,
  IFinancialCodeListResponse,
  ICreateFinancialCode,
} from '@/modules/financialCodes/types/financialCodeTypes';

const buildQueryString = (params?: IFinancialCodeListQuery) => {
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

export const financialCodesApi = {
  getFinancialCodes: async (
    params?: IFinancialCodeListQuery
  ): Promise<IFinancialCodeListResponse> => {
    const res = await apiClient.get<IFinancialCodeListResponse>(
      `/financial-codes${buildQueryString(params)}`
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

  getFinancialCodeById: async (
    id: string
  ): Promise<IFinancialCode | undefined> => {
    const res = await apiClient.get<IFinancialCode>(`/financial-codes/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  getFinancialCodeByCode: async (
    code: string
  ): Promise<IFinancialCode | undefined> => {
    const res = await apiClient.get<IFinancialCode>(`/financial-codes/by-code/${code}`);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  createFinancialCode: async (
    values: ICreateFinancialCode
  ): Promise<IFinancialCode> => {
    const sanitizedSubProfiles = (values.subProfiles ?? []).map(sp => ({
      financialSubCode: sp.financialSubCode,
      financialSubName: sp.financialSubName,
      priority: Number(sp.priority),
    }));
    const payload = {
      ...values,
      subProfiles: sanitizedSubProfiles,
    };
    const res = await apiClient.post<IFinancialCode>('/financial-codes', payload);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create financial code');
    return res.data;
  },

  updateFinancialCode: async (
    id: string,
    values: ICreateFinancialCode
  ): Promise<IFinancialCode | undefined> => {
    const sanitizedSubProfiles = (values.subProfiles ?? []).map(sp => ({
      id: sp.id,
      financialSubCode: sp.financialSubCode,
      financialSubName: sp.financialSubName,
      priority: Number(sp.priority),
    }));
    const payload = {
      ...values,
      subProfiles: sanitizedSubProfiles,
    };
    const res = await apiClient.put<IFinancialCode>(`/financial-codes/${id}`, payload);
    if (res.error) throw new Error(res.error);
    return res.data;
  },

  deleteFinancialCode: async (
    id: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/financial-codes/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to delete financial code');
    return res.data;
  },
};
export default financialCodesApi;
