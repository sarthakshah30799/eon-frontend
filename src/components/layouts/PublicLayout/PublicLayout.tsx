import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../lib/AuthContext';
import { Loader } from '@/components/ui/loader';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
