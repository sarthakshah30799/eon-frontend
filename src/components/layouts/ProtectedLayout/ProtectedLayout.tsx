import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../lib/AuthContext';
import { DashboardLayout } from '../DashboardLayout';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
}) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-b-2 border-primary-600"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <DashboardLayout>{children}</DashboardLayout>;
};
