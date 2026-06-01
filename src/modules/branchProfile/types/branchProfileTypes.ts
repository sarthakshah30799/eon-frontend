export interface BranchProfileOption {
  value: string;
  label: string;
}

export interface BranchCounterFormValues {
  counterCode: string;
  counterName: string;
  isActive: boolean;
}

export interface BranchCounterRecord extends BranchCounterFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type BranchProfileSavePayload = BranchProfileFormValues;

export interface BranchProfileFormValues {
  branchName: string;
  branchCode: string;
  branchNo: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  stateId: string;
  stdCode: string;
  pinCode: string;
  operationalGroupId: string;
  phoneNo1CountryCode: string;
  phoneNo1: string;
  phoneNo2CountryCode: string;
  phoneNo2: string;
  faxNo1CountryCode: string;
  faxNo1: string;
  faxNo2CountryCode: string;
  faxNo2: string;
  emailId: string;
  contactPerson: string;
  contactNoCountryCode: string;
  contactNo: string;
  locationTypeId: string;
  operationalUserId: string;
  acUserInchargeId: string;
  aiiNo: string;
  wuAiiNo: string;
  rbiLicenceNo: string;
  rbiRegDate: string;
  authSignatory: string;
  branchAttachedToId: string;
  wuAcBranchPostingId: string;
  cashLimit: string;
  ibmHo1: string;
  ibmHo2: string;
  ibmBranchId: string;
  lastSettlementRef: string;
  currencyLimit: string;
  tempCashLimit: string;
  tempCurrencyLimit: string;
  connectCounterIds: string[];
  branchHasShifts: boolean;
  canReferenceOnBehalfEntries: boolean;
  serviceTaxApplicable: boolean;
  serviceTaxRegnNo: string;
}

export interface BranchProfileRecord extends BranchProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
