import { apiClient } from '../api';
import type {
  ICreateUserProfile,
  IUserProfile,
} from '@/modules/userProfile/types';

interface BackendUser {
  id: string;
  code: string;
  name: string;
  contactNo: string;
  email: string;
  employeeNo: string;
  designation: string;
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

const mapBackendToFrontend = (user: BackendUser): IUserProfile => {
  return {
    id: user.id,
    code: user.code || '',
    name: user.name || '',
    contactNo: user.contactNo || '',
    email: user.email || '',
    employeeNo: user.employeeNo || '',
    designation: user.designation || '',
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

type BackendUserPayload = {
  code: string;
  name: string;
  contactNo?: string;
  email: string;
  employeeNo?: string;
  designation?: string;
  userLicNo?: string;
  isActive: boolean;
  isLocked: boolean;
  isDormant: boolean;
  roleId?: string;
  branchId?: string;
  counterId?: string;
  password?: string;
};

const mapFrontendToBackend = (
  form: ICreateUserProfile,
  isCreate: boolean
): BackendUserPayload => {
  const payload: BackendUserPayload = {
    code: form.code,
    name: form.name,
    contactNo: form.contactNo || undefined,
    email: form.email,
    employeeNo: form.employeeNo || undefined,
    designation: form.designation || undefined,
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
  getUserProfiles: async (): Promise<IUserProfile[]> => {
    const res = await apiClient.get<BackendUser[]>('/users');
    if (res.error) throw new Error(res.error);
    return (res.data || []).map(mapBackendToFrontend);
  },
  getUserProfileById: async (id: string): Promise<IUserProfile> => {
    const res = await apiClient.get<BackendUser>(`/users/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('User not found');
    return mapBackendToFrontend(res.data);
  },
  createUserProfile: async (
    data: ICreateUserProfile
  ): Promise<IUserProfile> => {
    const backendData = mapFrontendToBackend(data, true);
    const res = await apiClient.post<BackendUser>('/users', backendData);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create user');
    return mapBackendToFrontend(res.data);
  },
  updateUserProfile: async (
    id: string,
    data: Partial<ICreateUserProfile>
  ): Promise<IUserProfile> => {
    const backendData = mapFrontendToBackend(data as ICreateUserProfile, false);
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
