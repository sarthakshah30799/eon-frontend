import { apiClient } from '../api';
import type {
  ICreateUserRole,
  IUserRole,
} from '@/modules/userRole/types';

interface BackendRole {
  id: string;
  code: string;
  name: string;
  isAdmin: boolean;
  isMd: boolean;
  isCompliance: boolean;
  isSrFinance: boolean;
  isFinance: boolean;
  isBrnMgr: boolean;
  isExecutive: boolean;
  isCardStk: boolean;
  isDeliveryBoy: boolean;
  isCashier: boolean;
  isSalesMgr: boolean;
  isActive: boolean;
  isAeonAccess: boolean;
  isDelPortalAccess: boolean;
  isDelAppAccess: boolean;
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontend = (role: BackendRole): IUserRole => {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    isAdmin: role.isAdmin,
    isMd: role.isMd,
    isCompliance: role.isCompliance,
    isSrFinance: role.isSrFinance,
    isFinance: role.isFinance,
    isBrnMgr: role.isBrnMgr,
    isExecutive: role.isExecutive,
    isCardStk: role.isCardStk,
    isDeliveryBoy: role.isDeliveryBoy,
    isCashier: role.isCashier,
    isSalesMgr: role.isSalesMgr,
    isActive: role.isActive,
    isAeonAccess: role.isAeonAccess,
    isDelPortalAccess: role.isDelPortalAccess,
    isDelAppAccess: role.isDelAppAccess,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

export const userRoleApi = {
  getUserRoles: async (): Promise<IUserRole[]> => {
    const res = await apiClient.get<BackendRole[]>('/roles');
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },

  getUserRoleById: async (id: string): Promise<IUserRole> => {
    const res = await apiClient.get<BackendRole>(`/roles/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Role not found');
    return mapBackendToFrontend(res.data);
  },

  createUserRole: async (data: ICreateUserRole): Promise<IUserRole> => {
    const res = await apiClient.post<BackendRole>('/roles', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create role');
    return mapBackendToFrontend(res.data);
  },

  updateUserRole: async (
    id: string,
    data: ICreateUserRole
  ): Promise<IUserRole> => {
    const res = await apiClient.put<BackendRole>(`/roles/${id}`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update role');
    return mapBackendToFrontend(res.data);
  },

  updateUserRoleStatus: async (
    id: string,
    isActive: boolean
  ): Promise<IUserRole | undefined> => {
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
