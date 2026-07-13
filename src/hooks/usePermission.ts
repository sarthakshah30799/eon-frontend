import { useAuth } from '../lib/AuthContext';
import { useMemo } from 'react';

const normalizePermissionPath = (value: string) =>
  value !== '/' ? value.replace(/\/+$/, '') : value;

const PARTY_PROFILE_PATH_ALIAS_MAP: Record<string, string[]> = {
  '/party-profiles/foreign-correspondent': ['/party-profiles/forex-correspondent'],
  '/party-profiles/forex-correspondent': ['/party-profiles/foreign-correspondent'],
};

const getPermissionPathAliases = (path: string) => {
  return [path, ...(PARTY_PROFILE_PATH_ALIAS_MAP[path] || [])];
};

export interface UsePermissionResult {
  canAdd: boolean;
  canModify: boolean;
  canDelete: boolean;
  canView: boolean;
  canExport: boolean;
  canAuthorize: boolean;
  canReject: boolean;
  hasAnyPermission: boolean;
}

export const usePermission = (path?: string): UsePermissionResult => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        canAdd: false,
        canModify: false,
        canDelete: false,
        canView: false,
        canExport: false,
        canAuthorize: false,
        canReject: false,
        hasAnyPermission: false,
      };
    }

    if (user.isHo || user.isHoStaff) {
      return {
        canAdd: true,
        canModify: true,
        canDelete: true,
        canView: true,
        canExport: true,
        canAuthorize: true,
        canReject: true,
        hasAnyPermission: true,
      };
    }

    if (user.isAdmin) {
      return {
        canAdd: true,
        canModify: true,
        canDelete: true,
        canView: true,
        canExport: true,
        canAuthorize: true,
        canReject: true,
        hasAnyPermission: true,
      };
    }

    if (!path) {
      return {
        canAdd: false,
        canModify: false,
        canDelete: false,
        canView: false,
        canExport: false,
        canAuthorize: false,
        canReject: false,
        hasAnyPermission: false,
      };
    }

    const normalizedPath = normalizePermissionPath(path);
    const candidatePaths = getPermissionPathAliases(normalizedPath);
    const matchingPermissionEntry = Object.entries(user.permissions || {})
      .map(([permissionPath, granted]) => [normalizePermissionPath(permissionPath), granted] as const)
      .filter(([permissionPath]) =>
        candidatePaths.includes(permissionPath) ||
        candidatePaths.some(candidatePath => candidatePath.startsWith(`${permissionPath}/`))
      )
      .sort((a, b) => b[0].length - a[0].length)[0];

    const permissions =
      matchingPermissionEntry?.[1] ||
      candidatePaths.flatMap(candidatePath => user.permissions?.[candidatePath] || []) || [];

    return {
      canAdd: permissions.includes('add'),
      canModify: permissions.includes('modify'),
      canDelete: permissions.includes('delete'),
      canView: permissions.includes('view'),
      canExport: permissions.includes('export'),
      canAuthorize: permissions.includes('authorized'),
      canReject: permissions.includes('rejected'),
      hasAnyPermission: permissions.length > 0,
    };
  }, [user, path]);
};
