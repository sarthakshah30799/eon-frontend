import { apiClient } from '../api';
import type {
  CompanyProfile,
  CompanyProfileFormValues,
} from '../../modules/companyProfile/types';

export const companyProfileApi = {
  getCompanyProfiles: async () => {
    return apiClient.get<CompanyProfile[]>('/companies');
  },
  getCompanyProfileById: async (id: string) => {
    return apiClient.get<CompanyProfile>(`/companies/${id}`);
  },
  createCompanyProfile: async (values: CompanyProfileFormValues) => {
    const { id: _, createdAt: __, updatedAt: ___, ...payload } = values as any;
    return apiClient.post<CompanyProfile>('/companies', payload);
  },
  updateCompanyProfile: async (
    id: string,
    values: CompanyProfileFormValues
  ) => {
    const { id: _, createdAt: __, updatedAt: ___, ...payload } = values as any;
    return apiClient.put<CompanyProfile>(`/companies/${id}`, payload);
  },
  deleteCompanyProfile: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/companies/${id}`);
  },
};
