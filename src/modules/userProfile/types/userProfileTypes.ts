export interface UserProfileFormValues {
  userCode: string;
  password?: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phoneNumber: string;
  status?: 'pending' | 'active' | 'inactive';
  isHo?: boolean;
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
