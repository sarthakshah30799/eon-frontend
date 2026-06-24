export interface IUserProfileAssignment {
  roleId: string;
  roleLabel: string;
  branchId: string;
  branchLabel: string;
  counterId: string;
  counterLabel: string;
}

export interface IUserProfile {
  id: string;
  code: string;
  name: string;
  contactNo: string;
  email: string;
  employeeNo: string;
  designation: string;
  userLicNo: string;
  isActive: boolean;
  isLocked: boolean;
  isDormant: boolean;
  roleId: string;
  roleName?: string;
  branchId: string;
  branchName?: string;
  counterId: string;
  counterName?: string;
  assignments: IUserProfileAssignment[];
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
