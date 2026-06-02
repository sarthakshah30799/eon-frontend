import { apiClient } from '../api';
import type {
  UserRoleFormValues,
  UserRoleRecord,
} from '@/modules/userRole/types';

interface BackendRole {
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
}

const mapBackendToFrontend = (role: BackendRole): UserRoleRecord => {
  return {
    id: role.id,
    userGroupCode: role.userGroupCode,
    userGroupName: role.userGroupName,
    isAdminGrp: role.isAdminGrp,
    isMdGroup: role.isMdGroup,
    isComplianceGrp: role.isComplianceGrp,
    isSrFinanceGrp: role.isSrFinanceGrp,
    isFinanceGrp: role.isFinanceGrp,
    isBrnMgrGrp: role.isBrnMgrGrp,
    isExecutiveGrp: role.isExecutiveGrp,
    isCardStkGrp: role.isCardStkGrp,
    isDeliveryBoyGrp: role.isDeliveryBoyGrp,
    isCashierGrp: role.isCashierGrp,
    isSalesMgrGrp: role.isSalesMgrGrp,
    isActive: role.isActive,
    isAeonAccess: role.isAeonAccess,
    isDelPortalAccess: role.isDelPortalAccess,
    isDelAppAccess: role.isDelAppAccess,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

export const userRoleApi = {
  getUserRoles: async (): Promise<UserRoleRecord[]> => {
    const res = await apiClient.get<BackendRole[]>('/roles');
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },

  getUserRoleById: async (id: string): Promise<UserRoleRecord> => {
    const res = await apiClient.get<BackendRole>(`/roles/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Role not found');
    return mapBackendToFrontend(res.data);
  },

  createUserRole: async (data: UserRoleFormValues): Promise<UserRoleRecord> => {
    const res = await apiClient.post<BackendRole>('/roles', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create role');
    return mapBackendToFrontend(res.data);
  },

  updateUserRole: async (
    id: string,
    data: UserRoleFormValues
  ): Promise<UserRoleRecord> => {
    const res = await apiClient.put<BackendRole>(`/roles/${id}`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update role');
    return mapBackendToFrontend(res.data);
  },

  updateUserRoleStatus: async (
    id: string,
    isActive: boolean
  ): Promise<UserRoleRecord | undefined> => {
    const res = await apiClient.put<BackendRole>(`/roles/${id}`, { isActive });
    if (res.error) throw new Error(res.error);
    return res.data ? mapBackendToFrontend(res.data) : undefined;
  },

  deleteUserRole: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/roles/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },

  getRolePermissions: async (id: string): Promise<Record<string, Record<string, boolean>>> => {
    const res = await apiClient.get<Record<string, Record<string, boolean>>>(`/roles/${id}/permissions`);
    if (res.error) throw new Error(res.error);
    return res.data || {};
  },

  saveRolePermissions: async (
    id: string,
    permissions: Record<string, Record<string, boolean>>
  ): Promise<boolean> => {
    const res = await apiClient.post<{ message: string }>(`/roles/${id}/permissions`, permissions);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
