import { apiClient } from '../api';
import type {
  UserRoleFormValues,
  UserRoleRecord,
} from '@/modules/userRole/types';

export const userRoleApi = {
  getUserRoles: async (): Promise<UserRoleRecord[]> => {
    const res = await apiClient.get<UserRoleRecord[]>('/roles');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
  getUserRoleById: async (id: string): Promise<UserRoleRecord> => {
    const res = await apiClient.get<UserRoleRecord>(`/roles/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Role not found');
    return res.data;
  },
  createUserRole: async (data: UserRoleFormValues): Promise<UserRoleRecord> => {
    const res = await apiClient.post<UserRoleRecord>('/roles', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create role');
    return res.data;
  },
  updateUserRole: async (
    id: string,
    data: UserRoleFormValues
  ): Promise<UserRoleRecord> => {
    const res = await apiClient.put<UserRoleRecord>(`/roles/${id}`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update role');
    return res.data;
  },
  updateUserRoleStatus: async (
    id: string,
    isActive: boolean
  ): Promise<UserRoleRecord | undefined> => {
    const roles = readStoredRoles();
    const existingRole = roles.find(role => role.id === id);

    if (!existingRole) {
      return undefined;
    }

    const updatedRole: UserRoleRecord = {
      ...existingRole,
      isActive,
      updatedAt: now(),
    };

    writeStoredRoles(
      roles.map(role => (role.id === id ? updatedRole : role))
    );

    return updatedRole;
  },
  deleteUserRole: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/roles/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
