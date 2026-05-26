import type { UserRoleFormValues, UserRoleRecord } from '../types';

export const createEmptyUserRoleFormValues = (): UserRoleFormValues => ({
  roleCode: '',
  roleName: '',
  isActive: true,
});

export const mapRecordToFormValues = (
  record: UserRoleRecord
): UserRoleFormValues => ({
  roleCode: record.roleCode,
  roleName: record.roleName,
  isActive: record.isActive,
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

