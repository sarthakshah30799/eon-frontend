import type { UserProfileFormValues, UserProfileRecord } from '../types';

export const createEmptyUserProfileFormValues = (): UserProfileFormValues => ({
  userCode: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  countryCode: 'IN',
  phoneNumber: '',
  status: 'active',
  isHo: false,
});

export const mapRecordToFormValues = (
  record: UserProfileRecord
): UserProfileFormValues => ({
  userCode: record.userCode || '',
  firstName: record.firstName || '',
  lastName: record.lastName || '',
  email: record.email || '',
  countryCode: record.countryCode || 'IN',
  phoneNumber: record.phoneNumber || '',
  status: record.status || 'active',
  isHo: record.isHo || false,
});

export const mapFormValuesToRecord = (
  values: UserProfileFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): UserProfileRecord => {
  const { password, ...rest } = values;
  return {
    id,
    createdAt,
    updatedAt,
    ...rest,
  };
};
