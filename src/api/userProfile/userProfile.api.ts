import { apiClient } from '../api';
import type {
  UserProfileFormValues,
  UserProfileRecord,
} from '@/modules/userProfile/types';

interface BackendUser {
  id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  status: 'pending' | 'active' | 'inactive';
  isHo: boolean;
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontend = (user: BackendUser): UserProfileRecord => {
  return {
    id: user.id,
    corporateClientId: 'client-1',
    code: user.userCode,
    name: `${user.firstName} ${user.lastName}`.trim(),
    cellNo: user.phoneNumber,
    emailId: user.email,
    branchId: 'branch-1',
    idWillExpireOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    groupId: 'group-1',
    purposeId: 'purpose-1',
    mpUsername: user.userCode.toLowerCase(),
    controlSetup: {
      isActive: user.status === 'active',
      isAdministrator: user.isHo,
      miscLimitAuthorization: false,
      canClearCounter: false,
      complianceAuthorization: false,
      dataEntryAuthorization: false,
      creditLimitAuthorization: false,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const mapFrontendToBackend = (form: UserProfileFormValues, isCreate: boolean): any => {
  const nameParts = (form.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '.';

  const payload: any = {
    userCode: form.code,
    firstName,
    lastName,
    email: form.emailId,
    countryCode: 'IN',
    phoneNumber: form.cellNo,
    status: form.controlSetup?.isActive ? 'active' : 'inactive',
    isHo: form.controlSetup?.isAdministrator || false,
  };

  if (isCreate) {
    payload.password = form.password || 'password123';
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
