import type { QueryClient } from '@tanstack/react-query';
import type { UserRoleFormValues, UserRoleRecord } from '../types';

export const createEmptyUserRoleFormValues = (): UserRoleFormValues => ({
  userGroupCode: '',
  userGroupName: '',
  isAdminGrp: false,
  isMdGroup: false,
  isComplianceGrp: false,
  isSrFinanceGrp: false,
  isFinanceGrp: false,
  isBrnMgrGrp: false,
  isExecutiveGrp: false,
  isCardStkGrp: false,
  isDeliveryBoyGrp: false,
  isCashierGrp: false,
  isSalesMgrGrp: false,
  isActive: true,
  isAeonAccess: false,
  isDelPortalAccess: false,
  isDelAppAccess: false,
});

export const mapRecordToFormValues = (
  record: UserRoleRecord
): UserRoleFormValues => ({
  userGroupCode: record.userGroupCode || '',
  userGroupName: record.userGroupName || '',
  isAdminGrp: !!record.isAdminGrp,
  isMdGroup: !!record.isMdGroup,
  isComplianceGrp: !!record.isComplianceGrp,
  isSrFinanceGrp: !!record.isSrFinanceGrp,
  isFinanceGrp: !!record.isFinanceGrp,
  isBrnMgrGrp: !!record.isBrnMgrGrp,
  isExecutiveGrp: !!record.isExecutiveGrp,
  isCardStkGrp: !!record.isCardStkGrp,
  isDeliveryBoyGrp: !!record.isDeliveryBoyGrp,
  isCashierGrp: !!record.isCashierGrp,
  isSalesMgrGrp: !!record.isSalesMgrGrp,
  isActive: record.isActive !== false,
  isAeonAccess: !!record.isAeonAccess,
  isDelPortalAccess: !!record.isDelPortalAccess,
  isDelAppAccess: !!record.isDelAppAccess,
});

export const mapFormValuesToRecord = (
  values: UserRoleFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): UserRoleRecord => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});

export const syncUserRoleCache = (
  queryClient: QueryClient,
  updatedRole: UserRoleRecord
): void => {
  queryClient.setQueryData<UserRoleRecord[] | undefined>(
    ['user-roles'],
    currentRoles =>
      currentRoles?.map(role =>
        role.id === updatedRole.id ? updatedRole : role
      ) ?? currentRoles
  );

  queryClient.setQueryData(['user-role', updatedRole.id], updatedRole);
};
