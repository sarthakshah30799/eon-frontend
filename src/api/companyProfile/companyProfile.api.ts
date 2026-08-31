import { apiClient } from '../api';
import type {
  ICompanyProfile,
  ICompanyProfileListQuery,
  ICompanyProfileListResponse,
  ICreateCompanyProfile,
} from '../../modules/companyProfile/types';
import { buildQueryString } from '@/utils';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

const normalizeCompanyProfilePayload = (values: ICreateCompanyProfile) => ({
  ...values,
  fxRegDate: values.fxRegDate || undefined,
  fromDate: values.fromDate || undefined,
  toDate: values.toDate || undefined,
});

export const companyProfileApi = {
  getCompanyProfiles: async (
    params?: ICompanyProfileListQuery
  ): Promise<ICompanyProfileListResponse> => {
    const res = await apiClient.get<ICompanyProfileListResponse>(
      `/companies${buildQueryString(params)}`
    );
    if (res.error) throw new Error(res.error);
    return normalizePaginatedResponse(res.data, params?.limit, params?.offset);
  },

  getAllCompanyProfiles: async (
    params?: Omit<ICompanyProfileListQuery, 'limit' | 'offset'>
  ): Promise<ICompanyProfile[]> =>
    fetchAllMatching(pagination =>
      companyProfileApi.getCompanyProfiles({ ...params, ...pagination })
    ),

  getCompanyProfileById: async (id: string) => {
    return apiClient.get<ICompanyProfile>(`/companies/${id}`);
  },
  createCompanyProfile: async (values: ICreateCompanyProfile) => {
    return apiClient.post<ICompanyProfile>(
      '/companies',
      normalizeCompanyProfilePayload(values)
    );
  },
  updateCompanyProfile: async (id: string, values: ICreateCompanyProfile) => {
    return apiClient.put<ICompanyProfile>(
      `/companies/${id}`,
      normalizeCompanyProfilePayload(values)
    );
  },
  deleteCompanyProfile: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/companies/${id}`);
  },
};
