import { apiClient } from '../api';
import { companyProfileApi } from '../companyProfile/companyProfile.api';
import type {
  IBranchProfile,
  ICreateBranchProfile,
} from '@/modules/branchProfile/types';

interface BackendBranch {
  id: string;
  company_id?: string | null;
  code: string;
  branchNumber: number;
  address1: string;
  address2?: string | null;
  address3?: string | null;
  city: string;
  state: string;
  gstState?: string | null;
  pinCode: string;
  gstNo?: string | null;
  fxRegNo?: string | null;
  fxRegDate?: string | null;
  contactName?: string | null;
  contactNo?: string | null;
  branchEmail?: string | null;
  aeonBranchLic?: string | null;
  locationType?: string | null;
  cashHolding?: number | null;
  cashHoldingTemp?: number | null;
  currHolding?: number | null;
  currHoldingTemp?: number | null;
  isHeadOffice: boolean;
  isActive: boolean;
  counterIds?: string[];
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontend = (branch: BackendBranch): IBranchProfile => {
  return {
    id: branch.id,
    code: branch.code || '',
    branchNumber: branch.branchNumber !== undefined ? String(branch.branchNumber) : '',
    address1: branch.address1 || '',
    address2: branch.address2 || '',
    address3: branch.address3 || '',
    city: branch.city || '',
    state: branch.state || '',
    gstState: branch.gstState || '',
    pinCode: branch.pinCode || '',
    gstNo: branch.gstNo || '',
    fxRegNo: branch.fxRegNo || '',
    fxRegDate: branch.fxRegDate ? branch.fxRegDate.slice(0, 10) : '',
    contactName: branch.contactName || '',
    contactNo: branch.contactNo || '',
    branchEmail: branch.branchEmail || '',
    aeonBranchLic: branch.aeonBranchLic || '',
    locationType: branch.locationType || '',
    cashHolding: branch.cashHolding !== null ? String(branch.cashHolding) : '0',
    cashHoldingTemp: branch.cashHoldingTemp !== null ? String(branch.cashHoldingTemp) : '0',
    currHolding: branch.currHolding !== null ? String(branch.currHolding) : '0',
    currHoldingTemp: branch.currHoldingTemp !== null ? String(branch.currHoldingTemp) : '0',
    isHeadOffice: !!branch.isHeadOffice,
    isActive: branch.isActive !== false,
    connectCounterIds: branch.counterIds || [],
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };
};

const mapFrontendToBackend = (
  form: ICreateBranchProfile,
  companyId?: string
) => {
  return {
    companyId: companyId || undefined,
    code: form.code,
    branchNumber: parseInt(form.branchNumber, 10) || 1,
    address1: form.address1,
    address2: form.address2 || undefined,
    address3: form.address3 || undefined,
    city: form.city,
    state: form.state,
    gstState: form.gstState || undefined,
    pinCode: form.pinCode,
    gstNo: form.gstNo || undefined,
    fxRegNo: form.fxRegNo || undefined,
    fxRegDate: form.fxRegDate || undefined,
    contactName: form.contactName || undefined,
    contactNo: form.contactNo || undefined,
    branchEmail: form.branchEmail || undefined,
    aeonBranchLic: form.aeonBranchLic || undefined,
    locationType: form.locationType || undefined,
    cashHolding: form.cashHolding ? parseFloat(form.cashHolding) : undefined,
    cashHoldingTemp: form.cashHoldingTemp ? parseFloat(form.cashHoldingTemp) : undefined,
    currHolding: form.currHolding ? parseFloat(form.currHolding) : undefined,
    currHoldingTemp: form.currHoldingTemp ? parseFloat(form.currHoldingTemp) : undefined,
    isHeadOffice: form.isHeadOffice,
    isActive: form.isActive,
    counterIds: form.connectCounterIds || [],
  };
};

export const branchProfileApi = {
  getBranchProfiles: async (): Promise<IBranchProfile[]> => {
    const res = await apiClient.get<BackendBranch[]>('/branches');
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },

  getBranchProfileById: async (
    id: string
  ): Promise<IBranchProfile | undefined> => {
    const res = await apiClient.get<BackendBranch>(`/branches/${id}`);
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  createBranchProfile: async (
    data: ICreateBranchProfile
  ): Promise<IBranchProfile> => {
    const companyRes = await companyProfileApi.getCompanyProfiles();
    const companyId =
      companyRes.data?.[0]?.id || '11111111-1111-4111-b111-111111111111';

    const backendData = mapFrontendToBackend(data, companyId);
    const res = await apiClient.post<BackendBranch>('/branches', backendData);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create branch');

    return mapBackendToFrontend(res.data);
  },

  updateBranchProfile: async (
    id: string,
    data: ICreateBranchProfile
  ): Promise<IBranchProfile | undefined> => {
    const companyRes = await companyProfileApi.getCompanyProfiles();
    const companyId =
      companyRes.data?.[0]?.id || '11111111-1111-4111-b111-111111111111';

    const backendData = mapFrontendToBackend(data, companyId);
    const res = await apiClient.put<BackendBranch>(
      `/branches/${id}`,
      backendData
    );
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  deleteBranchProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/branches/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
