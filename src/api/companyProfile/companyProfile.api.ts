import { apiClient } from '../api';
import type {
  ICompanyProfile,
  ICompanyProfileListQuery,
  ICreateCompanyProfile,
} from '../../modules/companyProfile/types';
import { buildQueryString } from '@/utils';

const normalizeCompanyProfilePayload = (values: ICreateCompanyProfile) => ({
  ...values,
  fxRegDate: values.fxRegDate || undefined,
  fromDate: values.fromDate || undefined,
  toDate: values.toDate || undefined,
});

export const companyProfileApi = {
  getCompanyProfiles: async (params?: ICompanyProfileListQuery) => {
    return apiClient.get<ICompanyProfile[]>(`/companies${buildQueryString(params)}`);
  },
  getCompanyProfileById: async (id: string) => {
    return apiClient.get<ICompanyProfile>(`/companies/${id}`);
  },
  createCompanyProfile: async (values: ICreateCompanyProfile) => {
    return apiClient.post<ICompanyProfile>('/companies', normalizeCompanyProfilePayload(values));
  },
  updateCompanyProfile: async (
    id: string,
    values: ICreateCompanyProfile
  ) => {
    return apiClient.put<ICompanyProfile>(
      `/companies/${id}`,
      normalizeCompanyProfilePayload(values)
    );
  },
  deleteCompanyProfile: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/companies/${id}`);
  },
};
