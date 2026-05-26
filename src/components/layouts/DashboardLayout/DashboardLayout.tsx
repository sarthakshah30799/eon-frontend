import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../../lib/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-primary-50 text-text-primary">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-primary-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-80">
        <Header
          userName={user?.name ?? user?.email ?? 'Admin'}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
