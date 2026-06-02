import { apiClient } from '../api';
import type {
  UserProfileFormValues,
  UserProfileRecord,
} from '@/modules/userProfile/types';

interface BackendUser {
  id: string;
  userCode: string;
  userName: string;
  userGroupCode: string;
  contactNo: string;
  emailId: string;
  employeeNo: string;
  designation: string;
  branchCode: string;
  userLicNo: string;
  isActive: boolean;
  isLocked: boolean;
  isDormant: boolean;
  roleId?: string;
  branchId?: string;
  counterId?: string;
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontend = (user: BackendUser): UserProfileRecord => {
  return {
    id: user.id,
    userCode: user.userCode || '',
    userName: user.userName || '',
    userGroupCode: user.userGroupCode || '',
    contactNo: user.contactNo || '',
    emailId: user.emailId || '',
    employeeNo: user.employeeNo || '',
    designation: user.designation || '',
    branchCode: user.branchCode || '',
    userLicNo: user.userLicNo || '',
    isActive: user.isActive !== false,
    isLocked: !!user.isLocked,
    isDormant: !!user.isDormant,
    roleId: user.roleId || '',
    branchId: user.branchId || '',
    counterId: user.counterId || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const mapFrontendToBackend = (form: UserProfileFormValues, isCreate: boolean): any => {
  const payload: any = {
    userCode: form.userCode,
    userName: form.userName,
    userGroupCode: form.userGroupCode || undefined,
    contactNo: form.contactNo || undefined,
    emailId: form.emailId,
    employeeNo: form.employeeNo || undefined,
    designation: form.designation || undefined,
    branchCode: form.branchCode || undefined,
    userLicNo: form.userLicNo || undefined,
    isActive: form.isActive !== false,
    isLocked: !!form.isLocked,
    isDormant: !!form.isDormant,
    roleId: form.roleId || undefined,
    branchId: form.branchId || undefined,
    counterId: form.counterId || undefined,
  };

  if (isCreate) {
    payload.password = form.password || 'temp1234';
  } else if (form.password) {
    payload.password = form.password;
  }

  return payload;
};

export const userProfileApi = {
  getUserProfiles: async (): Promise<UserProfileRecord[]> => {
    const res = await apiClient.get<BackendUser[]>('/users');
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },
  getUserProfileById: async (id: string): Promise<UserProfileRecord> => {
    const res = await apiClient.get<BackendUser>(`/users/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('User not found');
    return mapBackendToFrontend(res.data);
  },
  createUserProfile: async (
    data: UserProfileFormValues
  ): Promise<UserProfileRecord> => {
    const backendData = mapFrontendToBackend(data, true);
    const res = await apiClient.post<BackendUser>('/users', backendData);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create user');
    return mapBackendToFrontend(res.data);
  },
  updateUserProfile: async (
    id: string,
    data: Partial<UserProfileFormValues>
  ): Promise<UserProfileRecord> => {
    const backendData = mapFrontendToBackend(data as UserProfileFormValues, false);
    const res = await apiClient.put<BackendUser>(`/users/${id}`, backendData);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update user');
    return mapBackendToFrontend(res.data);
  },
  deleteUserProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<{ message: string }>(`/users/${id}`);
    if (res.error) throw new Error(res.error);
    return true;
  },
};
