import React from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { DashboardLayout } from '../DashboardLayout';
import { Navigate, useLocation, useMatches } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { DayWorkPromptModal } from '@/modules/dayEndStartProcess';
import { usePermission } from '@/hooks/usePermission';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

interface RouteHandle {
  isCatchAll?: boolean;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
}) => {
  const { isLoading, isAuthenticated, user, activeBranchId, activeCounterId } =
    useAuth();
  const location = useLocation();
  const matches = useMatches();
  const permission = usePermission(location.pathname);
  const canSkipWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const isCatchAllRoute = matches.some(
    match => (match.handle as RouteHandle | undefined)?.isCatchAll
  );
  const isRestrictedRoute =
    location.pathname !== '/' &&
    location.pathname !== '/dashboard' &&
    location.pathname !== '/choose-workplace' &&
    location.pathname !== '/login' &&
    location.pathname !== '/forgot-password' &&
    location.pathname !== '/reset-password' &&
    location.pathname !== '/mail-console';

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !canSkipWorkplace && (!activeBranchId || !activeCounterId)) {
    return <Navigate to="/choose-workplace" replace />;
  }

  if (
    !isCatchAllRoute &&
    isRestrictedRoute &&
    !permission.hasAnyPermission &&
    !canSkipWorkplace
  ) {
    return (
      <DashboardLayout>
        <AccessDeniedState
          message={PAGE_STATUS_TEXTS.ACCESS_DENIED_COUNTER_MESSAGE}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DayWorkPromptModal />
      {children}
    </DashboardLayout>
  );
};
