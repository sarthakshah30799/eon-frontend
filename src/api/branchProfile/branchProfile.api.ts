import { apiClient } from '../api';
import { companyProfileApi } from '../companyProfile/companyProfile.api';
import type {
  BranchProfileFormValues,
  BranchProfileRecord,
} from '@/modules/branchProfile/types';

interface BackendBranch {
  id: string;
  company_id?: string | null;
  branchCode: string;
  branchNumber: number;
  address1: string;
  address2?: string | null;
  address3?: string | null;
  pincode: string;
  city: string;
  state: string;
  country: string;
  stateCode: string;
  gstStateCode: string;
  countryCode1: string;
  phoneNumber1: string;
  countryCode2: string;
  phoneNumber2?: string | null;
  contactPersonName?: string | null;
  contactPersonCountryCode: string;
  contactPersonPhone?: string | null;
  operationGroup?: string | null;
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontend = (branch: BackendBranch): BranchProfileRecord => {
  return {
    id: branch.id,
    branchName: `Branch ${branch.branchCode}`,
    branchCode: branch.branchCode,
    branchNo: String(branch.branchNumber),
    address1: branch.address1,
    address2: branch.address2 || '',
    address3: branch.address3 || '',
    city: branch.city,
    stateId: branch.state,
    stdCode: '022',
    pinCode: branch.pincode,
    operationalGroupId: branch.operationGroup || 'city-location',
    phoneNo1CountryCode: branch.countryCode1 ? `+${branch.countryCode1.trim()}` : '+91',
    phoneNo1: branch.phoneNumber1,
    phoneNo2CountryCode: branch.countryCode2 ? `+${branch.countryCode2.trim()}` : '+91',
    phoneNo2: branch.phoneNumber2 || '',
    faxNo1CountryCode: '+91',
    faxNo1: '',
    faxNo2CountryCode: '+91',
    faxNo2: '',
    emailId: 'branch@example.com',
    contactPerson: branch.contactPersonName || '',
    contactNoCountryCode: branch.contactPersonCountryCode ? `+${branch.contactPersonCountryCode.trim()}` : '+91',
    contactNo: branch.contactPersonPhone || '',
    locationTypeId: 'branch',
    operationalUserId: 'operational-user-1',
    acUserInchargeId: 'ac-user-1',
    aiiNo: '',
    wuAiiNo: '',
    rbiLicenceNo: 'RBI-LIC',
    rbiRegDate: '2025-01-01',
    authSignatory: '',
    branchAttachedToId: '',
    wuAcBranchPostingId: '',
    cashLimit: '500000',
    ibmHo1: '',
    ibmHo2: '',
    ibmBranchId: '',
    lastSettlementRef: '',
    currencyLimit: '',
    tempCashLimit: '',
    tempCurrencyLimit: '',
    branchHasShifts: false,
    canReferenceOnBehalfEntries: false,
    serviceTaxApplicable: false,
    serviceTaxRegnNo: '',
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };
};

const mapFrontendToBackend = (form: BranchProfileFormValues, companyId?: string): any => {
  return {
    companyId: companyId || undefined,
    branchCode: form.branchCode,
    branchNumber: parseInt(form.branchNo, 10) || 1,
    address1: form.address1,
    address2: form.address2 || undefined,
    address3: form.address3 || undefined,
    pincode: form.pinCode,
    city: form.city,
    state: form.stateId || 'Maharashtra',
    country: 'India',
    stateCode: form.stateId ? form.stateId.slice(0, 2).toUpperCase() : 'MH',
    gstStateCode: form.serviceTaxRegnNo || '27',
    countryCode1: form.phoneNo1CountryCode ? form.phoneNo1CountryCode.replace('+', '') : 'IN',
    phoneNumber1: form.phoneNo1 || '',
    countryCode2: form.phoneNo2CountryCode ? form.phoneNo2CountryCode.replace('+', '') : 'IN',
    phoneNumber2: form.phoneNo2 || undefined,
    contactPersonName: form.contactPerson || undefined,
    contactPersonCountryCode: form.contactNoCountryCode ? form.contactNoCountryCode.replace('+', '') : 'IN',
    contactPersonPhone: form.contactNo || undefined,
    operationGroup: form.operationalGroupId || undefined,
  };
};

export const branchProfileApi = {
  getBranchProfiles: async (): Promise<BranchProfileRecord[]> => {
    const res = await apiClient.get<BackendBranch[]>('/branches');
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },

  getBranchProfileById: async (
    id: string
  ): Promise<BranchProfileRecord | undefined> => {
    const res = await apiClient.get<BackendBranch>(`/branches/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createBranchProfile: async (
    data: BranchProfileFormValues
  ): Promise<BranchProfileRecord> => {
    // Dynamically fetch first company to link it automatically
    const companyRes = await companyProfileApi.getCompanyProfiles();
    const companyId = companyRes.data?.[0]?.id || '11111111-1111-4111-b111-111111111111';

    const backendData = mapFrontendToBackend(data, companyId);
    const res = await apiClient.post<BackendBranch>('/branches', backendData);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create branch');

    return mapBackendToFrontend(res.data);
  },

  updateBranchProfile: async (
    id: string,
    data: BranchProfileFormValues
  ): Promise<BranchProfileRecord | undefined> => {
    const companyRes = await companyProfileApi.getCompanyProfiles();
    const companyId = companyRes.data?.[0]?.id || '11111111-1111-4111-b111-111111111111';

    const backendData = mapFrontendToBackend(data, companyId);
    const res = await apiClient.put<BackendBranch>(`/branches/${id}`, backendData);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  deleteBranchProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/branches/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
