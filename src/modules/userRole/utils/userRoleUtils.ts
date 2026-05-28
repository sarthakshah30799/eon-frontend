import type { QueryClient } from '@tanstack/react-query';
import type { UserRoleFormValues, UserRoleRecord } from '../types';

export const createEmptyUserRoleFormValues = (): UserRoleFormValues => ({
  code: '',
  name: '',
  description: '',
});

export const mapRecordToFormValues = (
  record: UserRoleRecord
): UserRoleFormValues => ({
  code: record.code || '',
  name: record.name || '',
  description: record.description || '',
});

export const mapFormValuesToRecord = (
  values: UserRoleFormValues,
  id: string,
  createdAt: string,
  updatedAt: string
): UserRoleRecord => ({
  id,
  createdAt,
  updatedAt,
  ...values,
});

export const syncUserRoleCache = (
  queryClient: QueryClient,
  updatedRole: UserRoleRecord
): void => {
  queryClient.setQueryData<UserRoleRecord[] | undefined>(
    ['user-roles'],
    currentRoles =>
      currentRoles?.map(role =>
        role.id === updatedRole.id ? updatedRole : role
      ) ?? currentRoles
  );

  queryClient.setQueryData(['user-role', updatedRole.id], updatedRole);
};
