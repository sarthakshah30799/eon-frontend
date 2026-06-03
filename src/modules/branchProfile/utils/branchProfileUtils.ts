import type {
  ICreateBranchProfile,
  IBranchProfileOption,
  IBranchProfile,
} from '../types';

export const createEmptyBranchProfileFormValues = (): ICreateBranchProfile => ({
  countryId: '',
  stateId: '',
  code: '',
  branchNumber: '',
  address1: '',
  address2: '',
  address3: '',
  city: '',
  gstState: '',
  pinCode: '',
  gstNo: '',
  fxRegNo: '',
  fxRegDate: '',
  contactName: '',
  contactNo: '',
  branchEmail: '',
  aeonBranchLic: '',
  locationType: '',
  cashHolding: '0',
  cashHoldingTemp: '0',
  currHolding: '0',
  currHoldingTemp: '0',
  isHeadOffice: false,
  isActive: true,
  connectCounterIds: [],
});

export const mapRecordToFormValues = (
  record: IBranchProfile
): ICreateBranchProfile => ({
  countryId: record.countryId || '',
  stateId: record.stateId || '',
  code: record.code || '',
  branchNumber: record.branchNumber || '',
  address1: record.address1 || '',
  address2: record.address2 || '',
  address3: record.address3 || '',
  city: record.city || '',
  gstState: record.gstState || '',
  pinCode: record.pinCode || '',
  gstNo: record.gstNo || '',
  fxRegNo: record.fxRegNo || '',
  fxRegDate: record.fxRegDate ? record.fxRegDate.slice(0, 10) : '',
  contactName: record.contactName || '',
  contactNo: record.contactNo || '',
  branchEmail: record.branchEmail || '',
  aeonBranchLic: record.aeonBranchLic || '',
  locationType: record.locationType || '',
  cashHolding: record.cashHolding || '0',
  cashHoldingTemp: record.cashHoldingTemp || '0',
  currHolding: record.currHolding || '0',
  currHoldingTemp: record.currHoldingTemp || '0',
  isHeadOffice: !!record.isHeadOffice,
  isActive: record.isActive !== false,
  connectCounterIds: record.connectCounterIds || [],
});

export const mapFormValuesToRecord = (
  values: ICreateBranchProfile,
  id: string,
  createdAt: string,
  updatedAt: string
): IBranchProfile => ({
  id,
  countryCode: '',
  countryName: '',
  stateCode: '',
  stateName: '',
  createdAt,
  updatedAt,
  ...values,
});

export const toBranchAttachedToOptions = (
  branches: IBranchProfile[],
  excludeId?: string
): IBranchProfileOption[] => {
  return branches
    .filter(branch => branch.id !== excludeId)
    .map(branch => ({
      value: branch.id,
      label: `${branch.branchNumber} (${branch.code})`,
    }));
};
