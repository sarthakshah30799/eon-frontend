export interface UserRoleFormValues {
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
}

export interface UserRoleRecord extends UserRoleFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
