import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/api/menu/menu.api';
import { MenuIcon, LogoutIcon } from '@/assets/icons';
import { resolveHeaderMeta } from '@/router/headerMeta';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui';

interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void | Promise<void>;
}

export const Header = ({ onMenuClick, onLogout }: HeaderProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, activeBranchId, activeCounterId, clearWorkplace } = useAuth();

  const activeAssignment = user?.assignments?.find(
    assignment =>
      assignment.branchId === activeBranchId &&
      assignment.counterId === activeCounterId
  );

  const activeBranchLabel =
    activeAssignment?.branchName || user?.branchName || 'Not selected';

  const activeCounterLabel =
    activeAssignment?.counterName ||
    user?.counterName ||
    (user?.counterNo ? `Counter ${user.counterNo}` : 'Not selected');
  const { data: menuTree = [] } = useQuery({
    queryKey: ['menu-tree'],
    queryFn: async () => {
      const response = await menuApi.getMenuTree();
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
  });

  const headerMeta = resolveHeaderMeta(pathname, menuTree);

  return (
    <header className="sticky top-0 z-20 border-b border-border-primary/80 bg-surface-primary/90 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-2 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            type="button"
            aria-label="Open sidebar"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg lg:hidden"
            onClick={onMenuClick}
          >
            <MenuIcon className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-text-primary sm:text-lg">
              {headerMeta.title}
            </h1>

            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <span>Branch: {activeBranchLabel || 'Not selected'}</span>
              <span>Counter: {activeCounterLabel || 'Not selected'}</span>
              <Button
                type="button"
                onClick={() => {
                  clearWorkplace();
                  navigate('/choose-workplace');
                }}
              >
                Change
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            variant="outline"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
