import type {
  ICreateUserProfile,
  IUserProfile,
} from '../types';

export const createEmptyUserProfileFormValues = (): ICreateUserProfile => ({
  code: '',
  name: '',
  contactNo: '',
  email: '',
  employeeNo: '',
  designation: '',
  userLicNo: '',
  isActive: true,
  isLocked: false,
  isDormant: false,
  roleId: '',
  branchId: '',
  counterId: '',
});

export const mapRecordToFormValues = (
  record: IUserProfile
): ICreateUserProfile => ({
  code: record.code || '',
  name: record.name || '',
  contactNo: record.contactNo || '',
  email: record.email || '',
  employeeNo: record.employeeNo || '',
  designation: record.designation || '',
  userLicNo: record.userLicNo || '',
  isActive: record.isActive !== false,
  isLocked: !!record.isLocked,
  isDormant: !!record.isDormant,
  roleId: record.roleId || '',
  branchId: record.branchId || '',
  counterId: record.counterId || '',
});

export const mapFormValuesToRecord = (
  values: ICreateUserProfile,
  id: string,
  createdAt: string,
  updatedAt: string
): IUserProfile => ({
  id,
  createdAt,
  updatedAt,
  code: values.code,
  name: values.name,
  contactNo: values.contactNo,
  email: values.email,
  employeeNo: values.employeeNo,
  designation: values.designation,
  userLicNo: values.userLicNo,
  isActive: values.isActive,
  isLocked: values.isLocked,
  isDormant: values.isDormant,
  roleId: values.roleId,
  branchId: values.branchId,
  counterId: values.counterId,
});
