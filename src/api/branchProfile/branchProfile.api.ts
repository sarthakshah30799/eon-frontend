import { apiClient } from '../api';

export interface BranchProfile {
  id: string;
  companyId?: string | null;
  companyName?: string | null;
  branchCode: string;
  branchNumber: number;
  address1: string;
  address2?: string;
  address3?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  stateCode: string;
  gstStateCode: string;
  countryCode1?: string;
  phoneNumber1: string;
  countryCode2?: string;
  phoneNumber2?: string;
  contactPersonName?: string;
  contactPersonCountryCode?: string;
  contactPersonPhone?: string;
  operationGroup?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BranchProfileFormValues = Omit<BranchProfile, 'id' | 'companyName' | 'createdAt' | 'updatedAt'>;

export const branchProfileApi = {
  getBranches: async () => {
    return apiClient.get<BranchProfile[]>('/branches');
  },
  getBranchById: async (id: string) => {
    return apiClient.get<BranchProfile>(`/branches/${id}`);
  },
  createBranch: async (values: BranchProfileFormValues) => {
    return apiClient.post<BranchProfile>('/branches', values);
  },
  updateBranch: async (id: string, values: BranchProfileFormValues) => {
    return apiClient.put<BranchProfile>(`/branches/${id}`, values);
  },
  deleteBranch: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/branches/${id}`);
  },
};
