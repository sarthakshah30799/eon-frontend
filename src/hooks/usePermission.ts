import { useAuth } from '../lib/AuthContext';
import { useMemo } from 'react';

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

    if (user.isHo) {
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

    let checkPath = path;
    const prefixes = [
      '/master/system-setups/company-profile',
      '/master/system-setups/branch-profile',
      '/master/system-setups/counter-profile',
      '/master/system-setups/country-profile',
      '/master/system-setups/state-profile',
      '/master/system-setups/user-profile',
      '/master/system-setups/user-role',
    ];

    for (const prefix of prefixes) {
      if (path.startsWith(prefix)) {
        checkPath = prefix;
        break;
      }
    }

    const permissions = user.permissions?.[checkPath] || [];

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
