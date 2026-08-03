import React from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { DashboardLayout } from '../DashboardLayout';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { DayWorkPromptModal } from '@/modules/dayEndStartProcess';
import { usePermission } from '@/hooks/usePermission';
import { NotFoundState } from '@/components/ui/not-found-state';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
}) => {
  const { isLoading, isAuthenticated, user, activeBranchId, activeCounterId } = useAuth();
  const location = useLocation();
  const permission = usePermission(location.pathname);
  const canSkipWorkplace = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
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

  if (isRestrictedRoute && !permission.hasAnyPermission && !canSkipWorkplace) {
    return (
      <DashboardLayout>
        <NotFoundState
          title="Access denied"
          message="You do not have permission to view this page for the selected counter."
          actionLabel="Go Home"
          actionTo="/"
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
