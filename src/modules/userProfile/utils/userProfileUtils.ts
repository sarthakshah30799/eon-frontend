import {
  BRANCH_OPTIONS,
  CORPORATE_CLIENT_OPTIONS,
  GROUP_OPTIONS,
  PURPOSE_OPTIONS,
} from '../constants';
import type {
  UserProfileFormValues,
  UserProfileOption,
  UserProfileRecord,
} from '../types';

export const getOptionLabel = (
  options: UserProfileOption[],
  value: string
): string => {
  return options.find(option => option.value === value)?.label ?? value;
};

export const getCorporateClientLabel = (value: string): string =>
  getOptionLabel(CORPORATE_CLIENT_OPTIONS, value);

export const getBranchLabel = (value: string): string =>
  getOptionLabel(BRANCH_OPTIONS, value);

export const getGroupLabel = (value: string): string =>
  getOptionLabel(GROUP_OPTIONS, value);

export const getPurposeLabel = (value: string): string =>
  getOptionLabel(PURPOSE_OPTIONS, value);

export const createEmptyUserProfileFormValues = (): UserProfileFormValues => ({
  corporateClientId: '',
  code: '',
  name: '',
  cellNo: '',
  emailId: '',
  branchId: '',
  idWillExpireOn: '',
  groupId: '',
  purposeId: '',
  mpUsername: '',
  controlSetup: {
    isActive: false,
    isAdministrator: false,
    miscLimitAuthorization: false,
    canClearCounter: false,
    complianceAuthorization: false,
    dataEntryAuthorization: false,
    creditLimitAuthorization: false,
  },
});

export const mapRecordToFormValues = (
  record: UserProfileRecord
): UserProfileFormValues => ({
  corporateClientId: record.corporateClientId,
  code: record.code,
  name: record.name,
  cellNo: record.cellNo,
  emailId: record.emailId,
  branchId: record.branchId,
  idWillExpireOn: record.idWillExpireOn,
  groupId: record.groupId,
  purposeId: record.purposeId,
  mpUsername: record.mpUsername,
  controlSetup: record.controlSetup,
});

export const mapFormValuesToRecord = (
  values: UserProfileFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): UserProfileRecord => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});

