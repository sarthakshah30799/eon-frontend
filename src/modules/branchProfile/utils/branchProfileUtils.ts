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
  countryId: record.country?.id || '',
  stateId: record.state?.id || '',
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
  locationType:
    typeof record.locationType === 'string'
      ? record.locationType
      : record.locationType?.id || '',
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
  country: null,
  state: null,
  createdAt,
  updatedAt,
  code: values.code,
  branchNumber: values.branchNumber,
  address1: values.address1,
  address2: values.address2,
  address3: values.address3,
  city: values.city,
  gstState: values.gstState,
  pinCode: values.pinCode,
  gstNo: values.gstNo,
  fxRegNo: values.fxRegNo,
  fxRegDate: values.fxRegDate,
  contactName: values.contactName,
  contactNo: values.contactNo,
  branchEmail: values.branchEmail,
  aeonBranchLic: values.aeonBranchLic,
  locationType: null,
  cashHolding: values.cashHolding,
  cashHoldingTemp: values.cashHoldingTemp,
  currHolding: values.currHolding,
  currHoldingTemp: values.currHoldingTemp,
  isHeadOffice: values.isHeadOffice,
  isActive: values.isActive,
  connectCounterIds: values.connectCounterIds,
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
