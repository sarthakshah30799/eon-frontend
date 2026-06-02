export interface BranchProfileOption {
  value: string;
  label: string;
}

export interface BranchProfileFormValues {
  branchCode: string;
  branchNumber: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  state: string;
  gstState: string;
  pinCode: string;
  gstNo: string;
  fxRegNo: string;
  fxRegDate: string;
  contactName: string;
  contactNo: string;
  branchEmailId: string;
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

export interface BranchProfileRecord extends BranchProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchCounterFormValues {
  counterCode: string;
  counterName: string;
  isActive: boolean;
}

export interface BranchCounterRecord extends BranchCounterFormValues {
  id: string;
}

