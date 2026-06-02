export interface IUserRole {
  id: string;
  userGroupCode: string;
  userGroupName: string;
  isAdminGrp: boolean;
  isMdGroup: boolean;
  isComplianceGrp: boolean;
  isSrFinanceGrp: boolean;
  isFinanceGrp: boolean;
  isBrnMgrGrp: boolean;
  isExecutiveGrp: boolean;
  isCardStkGrp: boolean;
  isDeliveryBoyGrp: boolean;
  isCashierGrp: boolean;
  isSalesMgrGrp: boolean;
  isActive: boolean;
  isAeonAccess: boolean;
  isDelPortalAccess: boolean;
  isDelAppAccess: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateUserRole = Omit<
  IUserRole,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateUserRole = Partial<ICreateUserRole>;
