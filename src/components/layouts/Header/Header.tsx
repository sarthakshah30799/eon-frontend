import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/api/menu/menu.api';
import { Dropdown, Button } from '@/components/ui';
import { MenuIcon, LogoutIcon, UserIcon } from '@/assets/icons';
import { resolveHeaderMeta } from '@/router/headerMeta';
import { useAuth } from '@/lib/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const getUserInitials = (name?: string, email?: string) => {
  const source = name?.trim() || email?.trim() || '';
  if (!source) return 'U';

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, activeBranchId, activeCounterId, clearWorkplace, logout } =
    useAuth();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const activeAssignment = user?.assignments?.find(
    assignment =>
      assignment.branchId === activeBranchId &&
      assignment.counterId === activeCounterId
  );

  const activeBranchLabel = activeAssignment?.branchName || 'Not selected';

  const activeCounterLabel = activeAssignment?.counterName || 'Not selected';
  const displayName = user?.name?.trim() || 'Profile';
  const userEmail = user?.email?.trim() || 'No email available';
  const userAvatar = user?.avatar;
  const userInitials = getUserInitials(user?.name, user?.email);
  const canShowAvatar = Boolean(userAvatar) && !avatarLoadError;
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
                onClick={async () => {
                  await clearWorkplace();
                  navigate('/choose-workplace');
                }}
              >
                Change
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Dropdown align="end" className="shrink-0">
            <Dropdown.Trigger
              aria-label={`Open profile menu for ${displayName}`}
              className="!rounded-full !border-border-primary !bg-surface-primary !px-2 !py-1.5 !shadow-sm hover:!bg-surface-secondary"
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-semibold text-text-inverse shadow-sm">
                {canShowAvatar ? (
                  <img
                    src={userAvatar!}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <>
                    {userInitials !== 'U' ? (
                      <span>{userInitials}</span>
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </>
                )}
              </span>

              <span className="hidden min-w-0 flex-col items-start leading-tight md:flex">
                <span className="max-w-40 truncate text-sm font-semibold text-text-primary">
                  {displayName}
                </span>
                <span className="max-w-40 truncate text-xs text-text-secondary">
                  {userEmail}
                </span>
              </span>
            </Dropdown.Trigger>

            <Dropdown.Menu portal className="w-72">
              <div className="flex items-center gap-3 px-3 py-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-semibold text-text-inverse shadow-sm">
                  {canShowAvatar ? (
                    <img
                      src={userAvatar!}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarLoadError(true)}
                    />
                  ) : (
                    <>
                      {userInitials !== 'U' ? (
                        <span>{userInitials}</span>
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </>
                  )}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    {userEmail}
                  </p>
                </div>
              </div>

              <Dropdown.Separator />

              <Dropdown.Item
                onClick={async () => {
                  await logout();
                }}
                className="gap-2 text-error-600 hover:bg-error-50 hover:text-error-700"
              >
                <LogoutIcon className="h-4 w-4" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
