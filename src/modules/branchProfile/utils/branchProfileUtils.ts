import type {
  BranchProfileFormValues,
  BranchProfileOption,
  BranchProfileRecord,
} from '../types';

export const createEmptyBranchProfileFormValues = (): BranchProfileFormValues => ({
  branchCode: '',
  branchNumber: '',
  address1: '',
  address2: '',
  address3: '',
  city: '',
  state: '',
  gstState: '',
  pinCode: '',
  gstNo: '',
  fxRegNo: '',
  fxRegDate: '',
  contactName: '',
  contactNo: '',
  branchEmailId: '',
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
  record: BranchProfileRecord
): BranchProfileFormValues => ({
  branchCode: record.branchCode || '',
  branchNumber: record.branchNumber || '',
  address1: record.address1 || '',
  address2: record.address2 || '',
  address3: record.address3 || '',
  city: record.city || '',
  state: record.state || '',
  gstState: record.gstState || '',
  pinCode: record.pinCode || '',
  gstNo: record.gstNo || '',
  fxRegNo: record.fxRegNo || '',
  fxRegDate: record.fxRegDate ? record.fxRegDate.slice(0, 10) : '',
  contactName: record.contactName || '',
  contactNo: record.contactNo || '',
  branchEmailId: record.branchEmailId || '',
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
  values: BranchProfileFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): BranchProfileRecord => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});

export const toBranchAttachedToOptions = (
  branches: BranchProfileRecord[],
  excludeId?: string
): BranchProfileOption[] => {
  return branches
    .filter(branch => branch.id !== excludeId)
    .map(branch => ({
      value: branch.id,
      label: `${branch.branchNumber} (${branch.branchCode})`,
    }));
};
