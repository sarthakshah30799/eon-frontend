import type { QueryClient } from '@tanstack/react-query';
import type { ICreateUserRole, IUserRole } from '../types';

export const createEmptyUserRoleFormValues = (): ICreateUserRole => ({
  code: '',
  name: '',
  isAdmin: false,
  isMd: false,
  isCompliance: false,
  isSrFinance: false,
  isFinance: false,
  isBrnMgr: false,
  isExecutive: false,
  isCardStk: false,
  isDeliveryBoy: false,
  isCashier: false,
  isSalesMgr: false,
  isActive: true,
  isAeonAccess: false,
  isDelPortalAccess: false,
  isDelAppAccess: false,
});

export const mapRecordToFormValues = (
  record: IUserRole
): ICreateUserRole => ({
  code: record.code || '',
  name: record.name || '',
  isAdmin: !!record.isAdmin,
  isMd: !!record.isMd,
  isCompliance: !!record.isCompliance,
  isSrFinance: !!record.isSrFinance,
  isFinance: !!record.isFinance,
  isBrnMgr: !!record.isBrnMgr,
  isExecutive: !!record.isExecutive,
  isCardStk: !!record.isCardStk,
  isDeliveryBoy: !!record.isDeliveryBoy,
  isCashier: !!record.isCashier,
  isSalesMgr: !!record.isSalesMgr,
  isActive: record.isActive !== false,
  isAeonAccess: !!record.isAeonAccess,
  isDelPortalAccess: !!record.isDelPortalAccess,
  isDelAppAccess: !!record.isDelAppAccess,
});

export const mapFormValuesToRecord = (
  values: ICreateUserRole,
  id: string,
  createdAt: string,
  updatedAt: string
): IUserRole => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});

export const syncUserRoleCache = (
  queryClient: QueryClient,
  updatedRole: IUserRole
): void => {
  queryClient.setQueryData<IUserRole[] | undefined>(
    ['user-roles'],
    currentRoles =>
      currentRoles?.map(role =>
        role.id === updatedRole.id ? updatedRole : role
      ) ?? currentRoles
  );

  queryClient.setQueryData(['user-role', updatedRole.id], updatedRole);
};
