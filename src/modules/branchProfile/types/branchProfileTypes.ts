import type { ICategoryOption } from '@/types/categoryOptionTypes';
import type { ICountryProfile } from '@/modules/countryProfile/types/countryProfileTypes';
import type { IStateProfile } from '@/modules/stateProfile/types/stateProfileTypes';

export interface IBranchProfileOption {
  value: string;
  label: string;
}

export interface IBranchProfile {
  id: string;
  country: ICountryProfile | null;
  state: IStateProfile | null;
  code: string;
  branchNumber: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  gstState: string;
  pinCode: string;
  gstNo: string;
  fxRegNo: string;
  fxRegDate: string;
  contactName: string;
  contactNo: string;
  branchEmail: string;
  aeonBranchLic: string;
  locationType: ICategoryOption | null;
  cashHolding: string;
  cashHoldingTemp: string;
  currHolding: string;
  currHoldingTemp: string;
  isHeadOffice: boolean;
  isActive: boolean;
  connectCounterIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateBranchProfile {
  countryId: string;
  stateId: string;
  code: string;
  branchNumber: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  gstState: string;
  pinCode: string;
  gstNo: string;
  fxRegNo: string;
  fxRegDate: string;
  contactName: string;
  contactNo: string;
  branchEmail: string;
  aeonBranchLic: string;
  locationType: string;
  cashHolding: string;
  cashHoldingTemp: string;
  currHolding: string;
  currHoldingTemp: string;
  isHeadOffice: boolean;
  isActive: boolean;
  connectCounterIds: string[];
}

export type IUpdateBranchProfile = Partial<ICreateBranchProfile>;

export interface IBranchCounter {
  id: string;
  counterNo: string;
  name: string;
  isActive: boolean;
}

export type ICreateBranchCounter = Omit<IBranchCounter, 'id'>;

export type IUpdateBranchCounter = Partial<ICreateBranchCounter>;
