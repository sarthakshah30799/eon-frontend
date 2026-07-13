import type { QueryClient } from '@tanstack/react-query';
import type {
  ICreateUserRole,
  IUserRole,
  UserRightsRowState,
} from '../types';

export const createEmptyUserRoleFormValues = (): ICreateUserRole => ({
  code: '',
  name: '',
  isAdmin: false,
  isMd: false,
  isCompliance: false,
  isSrFinance: false,
  isFinance: false,
  isBrnMgr: false,
  isHoStaff: false,
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
  isHoStaff: !!record.isHoStaff,
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
  queryClient.setQueriesData<IUserRole[]>(
    { queryKey: ['user-roles'] },
    currentRoles =>
      currentRoles?.map(role =>
        role.id === updatedRole.id ? updatedRole : role
      ) ?? currentRoles
  );

  queryClient.setQueryData(['user-role', updatedRole.id], updatedRole);
};

export const buildUserRightsPermissionGrid = (
  rowStateById: Record<string, UserRightsRowState>
): Record<string, Record<string, boolean>> => {
  const grid: Record<string, Record<string, boolean>> = {};

  for (const [menuId, state] of Object.entries(rowStateById)) {
    const hasAnyActive = Object.values(state.permissions).some(Boolean);
    if (hasAnyActive) {
      grid[menuId] = { ...state.permissions };
    }
  }

  return grid;
};
