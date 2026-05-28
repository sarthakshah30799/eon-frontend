import type { ReactNode } from 'react';
import { Header } from '../Header';
import { useAuth } from '../../../lib/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-surface-secondary via-surface-primary to-primary-50 text-text-primary">
      <div className="min-h-screen">
        <Header
          userName={user?.name ?? user?.email ?? 'Admin'}
          onLogout={handleLogout}
        />

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
