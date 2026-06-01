import { apiClient } from '../api';
import type {
  CompanyProfile,
  CompanyProfileFormValues,
} from '../../modules/companyProfile/types';

interface CompanyProfilePayload {
  logo: string;
  name: string;
  designation: string;
  rbiName: string;
  rbiPlace: string;
  address1: string;
  address2: string;
  address3: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
}

const toCompanyProfilePayload = (
  values: CompanyProfileFormValues
): CompanyProfilePayload => ({
  logo: values.logo,
  name: values.name,
  designation: values.designation,
  rbiName: values.rbiName,
  rbiPlace: values.rbiPlace,
  address1: values.address1,
  address2: values.address2,
  address3: values.address3,
  pincode: values.pincode,
  city: values.city,
  state: values.state,
  country: values.country,
});

export const companyProfileApi = {
  getCompanyProfiles: async () => {
    return apiClient.get<CompanyProfile[]>('/companies');
  },
  getCompanyProfileById: async (id: string) => {
    return apiClient.get<CompanyProfile>(`/companies/${id}`);
  },
  createCompanyProfile: async (values: CompanyProfileFormValues) => {
    return apiClient.post<CompanyProfile>(
      '/companies',
      toCompanyProfilePayload(values)
    );
  },
  updateCompanyProfile: async (
    id: string,
    values: CompanyProfileFormValues
  ) => {
    return apiClient.put<CompanyProfile>(
      `/companies/${id}`,
      toCompanyProfilePayload(values)
    );
  },
  deleteCompanyProfile: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/companies/${id}`);
  },
};
