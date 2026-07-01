import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { useAuth } from '../../../lib/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.setProperty(
      '--app-sidebar-offset',
      isSidebarCollapsed ? '4rem' : '16rem'
    );

    return () => {
      document.body.style.removeProperty('--app-sidebar-offset');
    };
  }, [isSidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className="h-screen overflow-hidden text-text-primary"
      style={{ backgroundColor: '#eef1f6' }}
    >
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-primary-900/15 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed(prev => !prev)}
      />

      <div
        className={[
          'flex h-full flex-col transition-[padding] duration-300',
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
        ].join(' ')}
      >
        <Header onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogout} />

        <main className="h-[calc(100vh-121px)] flex-1 overflow-y-auto p-5 pb-0! mb-16">
          <div className="mx-auto max-w-7xl h-full!">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
