import {
  AC_USER_INCHARGE_OPTIONS,
  IBM_BRANCH_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  OPERATIONAL_GROUP_OPTIONS,
  OPERATIONAL_USER_OPTIONS,
  STATE_OPTIONS,
  WU_AC_BRANCH_POSTING_OPTIONS,
  getBranchProfileText,
} from '../constants';
import type {
  BranchCounterFormValues,
  BranchCounterRecord,
  BranchProfileFormValues,
  BranchProfileOption,
  BranchProfileRecord,
} from '../types';

export const createEmptyBranchProfileFormValues = (): BranchProfileFormValues => ({
  branchName: '',
  branchCode: '',
  branchNo: '',
  address1: '',
  address2: '',
  address3: '',
  city: '',
  stateId: '',
  stdCode: '',
  pinCode: '',
  operationalGroupId: '',
  phoneNo1CountryCode: '+91',
  phoneNo1: '',
  phoneNo2CountryCode: '+91',
  phoneNo2: '',
  faxNo1CountryCode: '+91',
  faxNo1: '',
  faxNo2CountryCode: '+91',
  faxNo2: '',
  emailId: '',
  contactPerson: '',
  contactNoCountryCode: '+91',
  contactNo: '',
  locationTypeId: '',
  operationalUserId: '',
  acUserInchargeId: '',
  aiiNo: '',
  wuAiiNo: '',
  rbiLicenceNo: '',
  rbiRegDate: '',
  authSignatory: '',
  branchAttachedToId: '',
  wuAcBranchPostingId: '',
  cashLimit: '',
  ibmHo1: '',
  ibmHo2: '',
  ibmBranchId: '',
  lastSettlementRef: '',
  currencyLimit: '',
  tempCashLimit: '',
  tempCurrencyLimit: '',
  connectCounterIds: [],
  branchHasShifts: false,
  canReferenceOnBehalfEntries: false,
  serviceTaxApplicable: false,
  serviceTaxRegnNo: '',
});

export const mapRecordToFormValues = (
  record: BranchProfileRecord
): BranchProfileFormValues => ({
  branchName: record.branchName,
  branchCode: record.branchCode,
  branchNo: record.branchNo,
  address1: record.address1,
  address2: record.address2,
  address3: record.address3,
  city: record.city,
  stateId: record.stateId,
  stdCode: record.stdCode,
  pinCode: record.pinCode,
  operationalGroupId: record.operationalGroupId,
  phoneNo1CountryCode: record.phoneNo1CountryCode,
  phoneNo1: record.phoneNo1,
  phoneNo2CountryCode: record.phoneNo2CountryCode,
  phoneNo2: record.phoneNo2,
  faxNo1CountryCode: record.faxNo1CountryCode,
  faxNo1: record.faxNo1,
  faxNo2CountryCode: record.faxNo2CountryCode,
  faxNo2: record.faxNo2,
  emailId: record.emailId,
  contactPerson: record.contactPerson,
  contactNoCountryCode: record.contactNoCountryCode,
  contactNo: record.contactNo,
  locationTypeId: record.locationTypeId,
  operationalUserId: record.operationalUserId,
  acUserInchargeId: record.acUserInchargeId,
  aiiNo: record.aiiNo,
  wuAiiNo: record.wuAiiNo,
  rbiLicenceNo: record.rbiLicenceNo,
  rbiRegDate: record.rbiRegDate,
  authSignatory: record.authSignatory,
  branchAttachedToId: record.branchAttachedToId,
  wuAcBranchPostingId: record.wuAcBranchPostingId,
  cashLimit: record.cashLimit,
  ibmHo1: record.ibmHo1,
  ibmHo2: record.ibmHo2,
  ibmBranchId: record.ibmBranchId,
  lastSettlementRef: record.lastSettlementRef,
  currencyLimit: record.currencyLimit,
  tempCashLimit: record.tempCashLimit,
  tempCurrencyLimit: record.tempCurrencyLimit,
  connectCounterIds: record.connectCounterIds,
  branchHasShifts: record.branchHasShifts,
  canReferenceOnBehalfEntries: record.canReferenceOnBehalfEntries,
  serviceTaxApplicable: record.serviceTaxApplicable,
  serviceTaxRegnNo: record.serviceTaxRegnNo,
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

export const createEmptyBranchCounterFormValues =
  (): BranchCounterFormValues => ({
    counterCode: '',
    counterName: '',
    isActive: true,
  });

export const mapCounterRecordToFormValues = (
  record: BranchCounterRecord
): BranchCounterFormValues => ({
  counterCode: record.counterCode,
  counterName: record.counterName,
  isActive: record.isActive,
});

export const mapCounterFormValuesToRecord = (
  values: BranchCounterFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): BranchCounterRecord => ({
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
      label: `${branch.branchName} (${branch.branchCode})`,
    }));
};

const getText = (options: BranchProfileOption[], value: string): string =>
  getBranchProfileText(options, value);

export const getLocationTypeLabel = (value: string): string =>
  getText(LOCATION_TYPE_OPTIONS, value);

export const getOperationalGroupLabel = (value: string): string =>
  getText(OPERATIONAL_GROUP_OPTIONS, value);

export const getStateLabel = (value: string): string =>
  getText(STATE_OPTIONS, value);

export const getOperationalUserLabel = (value: string): string =>
  getText(OPERATIONAL_USER_OPTIONS, value);

export const getAcUserInchargeLabel = (value: string): string =>
  getText(AC_USER_INCHARGE_OPTIONS, value);

export const getWuAcBranchPostingLabel = (value: string): string =>
  getText(WU_AC_BRANCH_POSTING_OPTIONS, value);

export const getIbmBranchLabel = (value: string): string =>
  getText(IBM_BRANCH_OPTIONS, value);
