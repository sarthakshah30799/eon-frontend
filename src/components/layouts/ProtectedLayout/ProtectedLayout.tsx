import React from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { DashboardLayout } from '../DashboardLayout';
import { Navigate } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
}) => {
  const { isLoading, isAuthenticated, user, activeBranchId, activeCounterId } = useAuth();
  const canSkipWorkplace = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !canSkipWorkplace && (!activeBranchId || !activeCounterId)) {
    return <Navigate to="/choose-workplace" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};
