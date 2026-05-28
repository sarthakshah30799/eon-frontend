import { apiClient } from '../api';
import type {
  UserProfileFormValues,
  UserProfileRecord,
} from '@/modules/userProfile/types';

export const userProfileApi = {
  getUserProfiles: async (): Promise<UserProfileRecord[]> => {
    const res = await apiClient.get<UserProfileRecord[]>('/users');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },
  getUserProfileById: async (id: string): Promise<UserProfileRecord> => {
    const res = await apiClient.get<UserProfileRecord>(`/users/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('User not found');
    return res.data;
  },
  createUserProfile: async (
    data: UserProfileFormValues
  ): Promise<UserProfileRecord> => {
    const res = await apiClient.post<UserProfileRecord>('/users', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create user');
    return res.data;
  },
  updateUserProfile: async (
    id: string,
    data: Partial<UserProfileFormValues>
  ): Promise<UserProfileRecord> => {
    const res = await apiClient.put<UserProfileRecord>(`/users/${id}`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update user');
    return res.data;
  },
  deleteUserProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/users/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
