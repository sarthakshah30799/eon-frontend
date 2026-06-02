import type {
  ICreateUserProfile,
  IUserProfileOption,
  IUserProfile,
} from '../types';

export const getOptionLabel = (
  options: IUserProfileOption[],
  value: string
): string => {
  return options.find(option => option.value === value)?.label ?? value;
};

export const createEmptyUserProfileFormValues = (): ICreateUserProfile => ({
  userCode: '',
  userName: '',
  userGroupCode: '',
  contactNo: '',
  emailId: '',
  employeeNo: '',
  designation: '',
  branchCode: '',
  userLicNo: '',
  isActive: true,
  isLocked: false,
  isDormant: false,
  password: '',
  roleId: '',
  branchId: '',
  counterId: '',
});

export const mapRecordToFormValues = (
  record: IUserProfile
): ICreateUserProfile => ({
  userCode: record.userCode || '',
  userName: record.userName || '',
  userGroupCode: record.userGroupCode || '',
  contactNo: record.contactNo || '',
  emailId: record.emailId || '',
  employeeNo: record.employeeNo || '',
  designation: record.designation || '',
  branchCode: record.branchCode || '',
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
  userCode: values.userCode,
  userName: values.userName,
  userGroupCode: values.userGroupCode,
  contactNo: values.contactNo,
  emailId: values.emailId,
  employeeNo: values.employeeNo,
  designation: values.designation,
  branchCode: values.branchCode,
  userLicNo: values.userLicNo,
  isActive: values.isActive,
  isLocked: values.isLocked,
  isDormant: values.isDormant,
  roleId: values.roleId,
  branchId: values.branchId,
  counterId: values.counterId,
});
