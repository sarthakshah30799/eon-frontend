export interface IUserProfile {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateUserProfile = Omit<
  IUserProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateUserProfile = Partial<ICreateUserProfile>;

export interface IUserProfileOption {
  value: string;
  label: string;
}

export interface IUserProfileControlSetupItem {
  key: string;
  label: string;
}
