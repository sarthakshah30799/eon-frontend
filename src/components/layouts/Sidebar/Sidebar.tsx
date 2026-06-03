import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dropdown } from '../../ui/dropdown';
import { useMasterPages } from '../../../lib';
import { companyProfileApi, menuApi } from '../../../api';
import { useAuth } from '../../../lib/AuthContext';
import type { ICompanyProfile } from '../../../modules/companyProfile/types';
import type { IMasterPageTreeNode } from '../../../modules/masterPages/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SidebarLeafItem = {
  id: string;
  label: string;
  path?: string;
};

type SidebarMenuItem =
  | SidebarLeafItem
  | { id: string; label: string; children: SidebarMenuItem[] };

type SidebarSection = {
  title: string;
  items: SidebarMenuItem[];
};

const isExcludedProfile = (name: string, path?: string) => {
  const lowerName = name.toLowerCase();
  const lowerPath = path?.toLowerCase() || '';
  return (
    lowerName.includes('company') ||
    lowerName.includes('branch') ||
    lowerName.includes('counter') ||
    lowerPath.includes('company-profile') ||
    lowerPath.includes('branch-profile') ||
    lowerPath.includes('counter-profile')
  );
};

const ADMIN_DROPDOWN_SECTION: SidebarSection = {
  title: 'Admin',
  items: [
    {
      id: 'admin-company-profile',
      label: 'Company Profile',
      path: '/admin/company-profile',
    },
    {
      id: 'admin-branch-profile',
      label: 'Branch Profile',
      path: '/admin/branch-profile',
    },
    {
      id: 'admin-counter-profile',
      label: 'Counter Profile',
      path: '/admin/counter-profile',
    },
  ],
};

const sidebarSectionTriggerClass = (isActive = false) =>
  [
    'w-full justify-between rounded-none! border-0 border-b-1 border-white! px-4 py-3 text-left text-sm font-semibold shadow-none! transition hover:border-primary-200 hover:bg-white hover:text-primary-700 focus-visible:ring-primary-300',
    isActive
      ? 'bg-white! text-primary-700! shadow-sm'
      : 'bg-transparent! text-white!',
  ].join(' ');

const sidebarSectionMenuClass =
  'w-72 overflow-visible rounded-sm! border border-primary-500 bg-primary-500! p-2 shadow-lg ring-0';

const sidebarGroupTriggerClass = (level: number, isActive = false) =>
  [
    'w-full justify-between border-0 border-b-1 border-white! rounded-none! px-3 py-3 text-left text-sm font-semibold shadow-none! transition hover:border-primary-200 hover:bg-white hover:text-primary-700 focus-visible:ring-primary-300',
    level > 0 ? 'ml-2' : '',
    isActive
      ? 'bg-white! text-primary-700! shadow-sm'
      : 'bg-transparent! text-white!',
  ].join(' ');

const sidebarGroupMenuClass = (level: number) =>
  [
    'w-64 overflow-visible rounded-sm! border border-border-primary bg-primary-500! p-1 shadow-lg ring-0 text-white!',
    level > 0 ? 'ml-2' : '',
  ].join(' ');

const sidebarLeafClass = (isActive = false) =>
  [
    'flex w-full items-center gap-3 rounded-sm! px-3 py-2 text-left text-sm transition',
    isActive
      ? 'bg-white! text-primary-700! shadow-sm'
      : 'text-white hover:bg-white hover:text-primary-700',
  ].join(' ');

const mapMasterPageNodeToItem = (
  page: IMasterPageTreeNode
): SidebarMenuItem => {
  if (page.children.length === 0) {
    return {
      id: page.id,
      label: page.pageName,
      path: page.slug,
    };
  }

  return {
    id: page.id,
    label: page.pageName,
    children: page.children.map(mapMasterPageNodeToItem),
  };
};

const isGroupItem = (
  item: SidebarMenuItem
): item is { id: string; label: string; children: SidebarMenuItem[] } =>
  'children' in item;

const normalizePath = (path: string) =>
  path !== '/' ? path.replace(/\/+$/, '') : path;

const isPathActive = (currentPath: string, targetPath?: string) => {
  if (!targetPath) return false;

  const normalizedCurrentPath = normalizePath(currentPath);
  const normalizedTargetPath = normalizePath(targetPath);

  return (
    normalizedCurrentPath === normalizedTargetPath ||
    normalizedCurrentPath.startsWith(`${normalizedTargetPath}/`)
  );
};

const isMenuItemActive = (
  item: SidebarMenuItem,
  currentPath: string
): boolean => {
  if (isGroupItem(item)) {
    return item.children.some(child => isMenuItemActive(child, currentPath));
  }

  return isPathActive(currentPath, item.path);
};

interface SidebarMenuListProps {
  items: SidebarMenuItem[];
  level?: number;
  onNavigate: (path?: string) => void;
  currentPath: string;
}

const SidebarMenuList = ({
  items,
  level = 0,
  onNavigate,
  currentPath,
}: SidebarMenuListProps) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  return (
    <ul className="space-y-2">
      {items.map(item => {
        if (isGroupItem(item)) {
          const isActive = isMenuItemActive(item, currentPath);

          return (
            <li key={item.id}>
              <Dropdown
                className="w-full"
                align="start"
                open={openItemId === item.id}
                onOpenChange={nextOpen => {
                  setOpenItemId(nextOpen ? item.id : null);
                }}
              >
                <Dropdown.Trigger
                  className={sidebarGroupTriggerClass(level, isActive)}
                >
                  {item.label}
                </Dropdown.Trigger>

                <Dropdown.Menu
                  className={sidebarGroupMenuClass(level)}
                  placement="right"
                  portal
                  offset={12}
                >
                  <SidebarMenuList
                    items={item.children}
                    level={level + 1}
                    onNavigate={onNavigate}
                    currentPath={currentPath}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </li>
          );
        }

        const isActive = isMenuItemActive(item, currentPath);

        return (
          <li key={item.id} className="my-1">
            <button
              type="button"
              className={sidebarLeafClass(isActive)}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.path)}
            >
              <span className="truncate">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

interface SidebarTopLevelEntryProps {
  item: SidebarMenuItem;
  activeId: string | null;
  onOpenChange: (id: string | null) => void;
  onNavigate: (path?: string) => void;
  currentPath: string;
}

const SidebarTopLevelEntry = ({
  item,
  activeId,
  onOpenChange,
  onNavigate,
  currentPath,
}: SidebarTopLevelEntryProps) => {
  if (isGroupItem(item)) {
    const isActive = isMenuItemActive(item, currentPath);

    return (
      <Dropdown
        className="w-full border-0"
        align="start"
        open={activeId === item.id}
        onOpenChange={nextOpen => {
          onOpenChange(nextOpen ? item.id : null);
        }}
      >
        <Dropdown.Trigger className={sidebarSectionTriggerClass(isActive)}>
          {item.label}
        </Dropdown.Trigger>

        <Dropdown.Menu
          className={sidebarSectionMenuClass}
          placement="right"
          portal
          offset={12}
        >
          <SidebarMenuList
            items={item.children}
            onNavigate={onNavigate}
            currentPath={currentPath}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  const isActive = isMenuItemActive(item, currentPath);

  return (
    <button
      type="button"
      className={sidebarSectionTriggerClass(isActive)}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onNavigate(item.path)}
    >
      {item.label}
    </button>
  );
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tree: createdPages } = useMasterPages();
  const [openTopLevelId, setOpenTopLevelId] = useState<string | null>(null);

  const { data: menuTree = [] } = useQuery({
    queryKey: ['menu-tree'],
    queryFn: async () => {
      const response = await menuApi.getMenuTree();
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
  });

  const { data: company = null } = useQuery({
    queryKey: ['company-profile-sidebar'],
    queryFn: async (): Promise<ICompanyProfile | null> => {
      const response = await companyProfileApi.getCompanyProfiles();
      if (response.error) throw new Error(response.error);
      return response.data?.[0] ?? null;
    },
  });

  const { user } = useAuth();

  const sections = useMemo<SidebarSection[]>(() => {
    const isAdminUser = user?.isAdmin === true;

    if (!menuTree || menuTree.length === 0) {
      return isAdminUser ? [ADMIN_DROPDOWN_SECTION] : [];
    }

    const hasViewPermission = (path?: string) => {
      if (isAdminUser) return true;
      if (!path) return false;
      return user?.permissions?.[path]?.includes('view') === true;
    };

    const dynamicSections = menuTree
      .map(root => {
        const items = (root.children || [])
          .filter(
            group => !isExcludedProfile(group.name, group.path ?? undefined)
          )
          .map(group => {
            if (!group.children || group.children.length === 0) {
              const isVisible = hasViewPermission(group.path || undefined);
              return {
                id: group.id,
                label: group.name,
                path: group.path || undefined,
                visible: isVisible,
              };
            }

            const mappedChildren = group.children
              .filter(
                item => !isExcludedProfile(item.name, item.path ?? undefined)
              )
              .map(item => {
                const isVisible = hasViewPermission(item.path ?? undefined);
                return {
                  id: item.id,
                  label: item.name,
                  path: item.path ?? undefined,
                  visible: isVisible,
                };
              })
              .filter(item => item.visible);

            return {
              id: group.id,
              label: group.name,
              children: mappedChildren.map(({ visible, ...rest }) => rest),
              visible: mappedChildren.length > 0,
            };
          })
          .filter(group => group.visible);

        return {
          title: root.name,
          items: items.map(({ visible, ...rest }) => rest as SidebarMenuItem),
          visible: items.length > 0,
        };
      })
      .filter(section => section.visible)
      .map(({ visible, ...rest }) => rest as SidebarSection);

    if (isAdminUser) {
      return [ADMIN_DROPDOWN_SECTION, ...dynamicSections];
    }

    return dynamicSections;
  }, [menuTree, user]);

  const createdPageEntries = useMemo<SidebarMenuItem[]>(
    () => createdPages.map(mapMasterPageNodeToItem),
    [createdPages]
  );

  const handleMenuClick = (path?: string) => {
    if (path) {
      navigate(path);
    }

    setOpenTopLevelId(null);
    onClose();
  };

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 w-70 border-r border-border-primary bg-primary-500 text-text-primary shadow-2xl transition-transform duration-300 ease-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border-primary bg-primary-500 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/favicon.svg"
                  alt="Maraekat logo"
                  className="h-7 w-7"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">
                {company?.name ?? 'Maraekat FX'}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-primary-500 text-white transition hover:bg-primary-50 lg:hidden"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-5">
            {sections.map(section => (
              <section key={section.title} className="space-y-2 mb-2">
                <Dropdown
                  className="w-full border-0!"
                  align="start"
                  open={openTopLevelId === section.title}
                  onOpenChange={nextOpen => {
                    setOpenTopLevelId(nextOpen ? section.title : null);
                  }}
                >
                  <Dropdown.Trigger
                    className={sidebarSectionTriggerClass(
                      section.items.some(item =>
                        isMenuItemActive(item, location.pathname)
                      )
                    )}
                  >
                    {section.title}
                  </Dropdown.Trigger>

                  <Dropdown.Menu
                    className={sidebarSectionMenuClass}
                    placement="right"
                    portal
                    offset={12}
                  >
                    <SidebarMenuList
                      items={section.items}
                      onNavigate={handleMenuClick}
                      currentPath={location.pathname}
                    />
                  </Dropdown.Menu>
                </Dropdown>
              </section>
            ))}

            {createdPageEntries.length > 0 && (
              <div className="space-y-3">
                {createdPageEntries.map(item => (
                  <SidebarTopLevelEntry
                    key={item.id}
                    item={item}
                    activeId={openTopLevelId}
                    onOpenChange={setOpenTopLevelId}
                    onNavigate={handleMenuClick}
                    currentPath={location.pathname}
                  />
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
