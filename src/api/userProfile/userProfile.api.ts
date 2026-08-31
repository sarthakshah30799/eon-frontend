import { apiClient } from '../api';
import { buildQueryString } from '@/utils';
import type {
  ICreateUserProfile,
  IUserProfile,
  IUserProfileListQuery,
  IUserProfileListResponse,
} from '@/modules/userProfile/types';
import { fetchAllMatching, normalizePaginatedResponse } from '@/utils/paginatedList';

interface BackendUserAssignment {
  roleId: string;
  roleName?: string;
  branchId: string;
  branchName?: string;
  counterId: string;
  counterName?: string;
}

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
  roleName?: string;
  branchId?: string;
  branchName?: string;
  counterId?: string;
  counterName?: string;
  assignments?: BackendUserAssignment[];
  createdAt: string;
  updatedAt: string;
}

interface BackendUserPayload {
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
  assignments?: Array<{
    roleId: string;
    branchId: string;
    counterId: string;
  }>;
}

const mapBackendToFrontend = (user: BackendUser): IUserProfile => {
  const assignments =
    user.assignments?.map(assignment => ({
      roleId: assignment.roleId || '',
      roleLabel: assignment.roleName || '',
      branchId: assignment.branchId || '',
      branchLabel: assignment.branchName || '',
      counterId: assignment.counterId || '',
      counterLabel: assignment.counterName || '',
    })) || [];

  const firstAssignment = assignments[0];

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
    roleId: firstAssignment?.roleId || user.roleId || '',
    roleName: firstAssignment?.roleLabel || user.roleName || '',
    branchId: firstAssignment?.branchId || user.branchId || '',
    branchName: firstAssignment?.branchLabel || user.branchName || '',
    counterId: firstAssignment?.counterId || user.counterId || '',
    counterName: firstAssignment?.counterLabel || user.counterName || '',
    assignments:
      assignments.length > 0
        ? assignments
        : user.roleId && user.branchId && user.counterId
          ? [
              {
                roleId: user.roleId,
                roleLabel: user.roleName || '',
                branchId: user.branchId,
                branchLabel: user.branchName || '',
                counterId: user.counterId,
                counterLabel: user.counterName || '',
              },
            ]
          : [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const mapFrontendToBackend = (form: ICreateUserProfile): BackendUserPayload => {
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
  };

  if (form.assignments?.length) {
    payload.assignments = form.assignments.map(assignment => ({
      roleId: assignment.roleId,
      branchId: assignment.branchId,
      counterId: assignment.counterId,
    }));
    return payload;
  }

  payload.roleId = form.roleId || undefined;
  payload.branchId = form.branchId || undefined;
  payload.counterId = form.counterId || undefined;
  return payload;
};

export const userProfileApi = {
  getUserProfiles: async (
    options?: IUserProfileListQuery
  ): Promise<IUserProfileListResponse> => {
    const endpoint = `/users${buildQueryString({
      activeOnly: options?.activeOnly === false ? 'false' : undefined,
      search: options?.search?.trim() || undefined,
      branchId: options?.branchId?.trim() || undefined,
      roleFilter: options?.roleFilter?.trim() || undefined,
      limit: options?.limit,
      offset: options?.offset,
    })}`;
    const res = await apiClient.get<IUserProfileListResponse>(endpoint);
    if (res.error) throw new Error(res.error);
    const payload = normalizePaginatedResponse(
      res.data
        ? {
            ...res.data,
            data: (res.data.data || []).map(mapBackendToFrontend),
          }
        : res.data,
      options?.limit,
      options?.offset
    );
    return payload;
  },

  getAllUserProfiles: async (
    options?: Omit<IUserProfileListQuery, 'limit' | 'offset'>
  ): Promise<IUserProfile[]> =>
    fetchAllMatching(pagination =>
      userProfileApi.getUserProfiles({ ...options, ...pagination })
    ),
  getUserProfileById: async (id: string): Promise<IUserProfile> => {
    const res = await apiClient.get<BackendUser>(`/users/${id}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('User not found');
    return mapBackendToFrontend(res.data);
  },
  createUserProfile: async (
    data: ICreateUserProfile
  ): Promise<IUserProfile> => {
    const backendData = mapFrontendToBackend(data);
    const res = await apiClient.post<BackendUser>('/users', backendData);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create user');
    return mapBackendToFrontend(res.data);
  },
  updateUserProfile: async (
    id: string,
    data: Partial<ICreateUserProfile>
  ): Promise<IUserProfile> => {
    const backendData = mapFrontendToBackend(data as ICreateUserProfile);
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
