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
    return apiClient.post<CompanyProfile>('/companies', values);
  },
  updateCompanyProfile: async (
    id: string,
    values: CompanyProfileFormValues
  ) => {
    return apiClient.put<CompanyProfile>(`/companies/${id}`, values);
  },
  deleteCompanyProfile: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/companies/${id}`);
  },
};
