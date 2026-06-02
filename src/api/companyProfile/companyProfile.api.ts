import { apiClient } from '../api';
import type {
  ICompanyProfile,
  ICreateCompanyProfile,
} from '../../modules/companyProfile/types';

export const companyProfileApi = {
  getCompanyProfiles: async () => {
    return apiClient.get<ICompanyProfile[]>('/companies');
  },
  getCompanyProfileById: async (id: string) => {
    return apiClient.get<ICompanyProfile>(`/companies/${id}`);
  },
  createCompanyProfile: async (values: ICreateCompanyProfile) => {
    return apiClient.post<ICompanyProfile>(
      '/companies',
      values
    );
  },
  updateCompanyProfile: async (
    id: string,
    values: ICreateCompanyProfile
  ) => {
    return apiClient.put<ICompanyProfile>(
      `/companies/${id}`,
      values
    );
  },
  deleteCompanyProfile: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/companies/${id}`);
  },
};
