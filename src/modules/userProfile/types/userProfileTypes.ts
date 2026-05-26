export interface UserProfileControlSetupValues {
  isActive: boolean;
  isAdministrator: boolean;
  miscLimitAuthorization: boolean;
  canClearCounter: boolean;
  complianceAuthorization: boolean;
  dataEntryAuthorization: boolean;
  creditLimitAuthorization: boolean;
}

export interface UserProfileFormValues {
  corporateClientId: string;
  code: string;
  name: string;
  cellNo: string;
  emailId: string;
  branchId: string;
  idWillExpireOn: string;
  groupId: string;
  purposeId: string;
  mpUsername: string;
  controlSetup: UserProfileControlSetupValues;
}

export interface UserProfileRecord extends UserProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileOption {
  value: string;
  label: string;
}

export interface UserProfileControlSetupItem {
  key: keyof UserProfileControlSetupValues;
  label: string;
}

