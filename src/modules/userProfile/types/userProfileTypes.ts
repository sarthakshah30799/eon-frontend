export interface UserProfileFormValues {
  userCode: string;
  userName: string;
  userGroupCode: string;
  contactNo: string;
  emailId: string;
  employeeNo: string;
  designation: string;
  branchCode: string;
  userLicNo: string;
  isActive: boolean;
  isLocked: boolean;
  isDormant: boolean;
  password?: string;
  roleId: string;
  branchId: string;
  counterId: string;
}

export interface UserProfileRecord extends Omit<UserProfileFormValues, 'password'> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileOption {
  value: string;
  label: string;
}

export interface UserProfileControlSetupItem {
  key: string;
  label: string;
}

