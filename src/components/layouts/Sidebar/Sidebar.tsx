import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMasterPages } from '../../../lib';
import { companyProfileApi, menuApi } from '../../../api';
import type { ICompanyProfile } from '../../../modules/companyProfile/types';
import type { IMasterPageTreeNode } from '../../../modules/masterPages/types';
import type { IMenu } from '../../../types/menuTypes';
import { Loader } from '@/components/ui/loader';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

type SidebarLeafItem = {
  id: string;
  label: string;
  path?: string;
};

type SidebarGroupItem = {
  id: string;
  label: string;
  children: SidebarItem[];
};

type SidebarItem = SidebarLeafItem | SidebarGroupItem;

type SidebarGroupSection = {
  title: string;
  items: SidebarItem[];
};

type SidebarLeafSection = SidebarLeafItem & {
  title: string;
};

type SidebarSection = SidebarGroupSection | SidebarLeafSection;

const compactLabel = (label: string) =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || label.slice(0, 2).toUpperCase();

const isGroupItem = (item: SidebarItem): item is SidebarGroupItem =>
  'children' in item;

const normalizePath = (path: string) =>
  path !== '/' ? path.replace(/\/+$/, '') : path;

const isPathActive = (currentPath: string, targetPath?: string) => {
  if (!targetPath) return false;

  const normalizedCurrentPath = normalizePath(currentPath);
  const normalizedTargetPath = normalizePath(targetPath);

  return (
    matchPath({ path: normalizedTargetPath, end: true }, normalizedCurrentPath) !==
    null
  );
};

const isMenuItemActive = (item: SidebarItem, currentPath: string): boolean => {
  if (isGroupItem(item)) {
    return item.children.some(child => isMenuItemActive(child, currentPath));
  }

  return isPathActive(currentPath, item.path);
};

const mapMasterPageNodeToItem = (page: IMasterPageTreeNode): SidebarItem => {
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

const resolveMenuPath = (path?: string, basePath = '') => {
  if (!path) return undefined;
  if (!basePath) return path;
  if (path.startsWith(basePath)) return path;
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
};

const mapMenuNodeToItem = (
  node: IMenu,
  basePath = ''
): SidebarItem | null => {
  const children = (node.children ?? [])
    .map(child => mapMenuNodeToItem(child, node.path ?? basePath))
    .filter(Boolean) as SidebarItem[];

  const resolvedPath = resolveMenuPath(node.path || undefined, basePath);

  if (children.length > 0) {
    return {
      id: node.id,
      label: node.name,
      children,
    };
  }

  if (!resolvedPath) {
    return null;
  }

  return {
    id: node.id,
    label: node.name,
    path: resolvedPath,
  };
};

const SidebarChevron = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className="h-3.5 w-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isOpen ? <path d="M6 8l4 4 4-4" /> : <path d="M8 6l4 4-4 4" />}
  </svg>
);

const getParentKey = (parentKey: string, itemId: string) =>
  `${parentKey}::${itemId}`;

const isGroupSection = (
  section: SidebarSection
): section is SidebarGroupSection => 'items' in section;

interface SidebarTreeProps {
  items: SidebarItem[];
  currentPath: string;
  onNavigate: (path?: string) => void;
  isCollapsed: boolean;
  parentKey: string;
  openByParent: Record<string, string>;
  collapsedByParent: Record<string, string>;
  setOpenByParent: Dispatch<SetStateAction<Record<string, string>>>;
  setCollapsedByParent: Dispatch<SetStateAction<Record<string, string>>>;
  depth?: number;
}

const SidebarTree = ({
  items,
  currentPath,
  onNavigate,
  isCollapsed,
  parentKey,
  openByParent,
  collapsedByParent,
  setOpenByParent,
  setCollapsedByParent,
  depth = 0,
}: SidebarTreeProps) => {
  return (
    <div className="space-y-0.5">
      {items.map(item => {
        if (!isGroupItem(item)) {
          const isActive = isPathActive(currentPath, item.path);

          return (
            <button
              key={item.id}
              type="button"
              className={[
                'group flex w-full cursor-pointer items-center rounded-md text-left text-sm transition',
                depth === 0
                  ? 'px-2 py-2'
                  : depth === 1
                    ? 'pl-5 pr-2 py-2'
                    : 'pl-8 pr-2 py-2',
                isActive
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-sidebar-muted hover:text-white',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.path)}
              title={item.label}
            >
              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                {isCollapsed ? compactLabel(item.label) : item.label}
              </span>
            </button>
          );
        }

        const isActiveGroup = item.children.some(child =>
          isMenuItemActive(child, currentPath)
        );
        const isOpen =
          openByParent[parentKey] === item.id ||
          (isActiveGroup && collapsedByParent[parentKey] !== item.id);

        return (
          <div key={item.id} className="space-y-1">
            <button
              type="button"
              className={[
                'group flex w-full cursor-pointer items-center justify-between gap-2 rounded-md text-left text-sm font-medium transition',
                depth === 0
                  ? 'px-2 py-2'
                  : depth === 1
                    ? 'pl-5 pr-2 py-2'
                    : 'pl-8 pr-2 py-2',
                isOpen
                  ? 'bg-sidebar-accent text-white shadow-sm border-l-2 border-primary-500'
                  : 'text-sidebar-muted! hover:text-white',
              ].join(' ')}
              aria-expanded={isOpen}
              onClick={() => {
                setOpenByParent(prev => {
                  const next = { ...prev };
                  if (next[parentKey] === item.id) {
                    delete next[parentKey];
                  } else {
                    next[parentKey] = item.id;
                  }
                  return next;
                });
                setCollapsedByParent(prev => {
                  const next = { ...prev };
                  if (next[parentKey] === item.id) {
                    delete next[parentKey];
                  } else if (isOpen) {
                    next[parentKey] = item.id;
                  }
                  return next;
                });
              }}
              title={item.label}
            >
              <span className="flex items-center gap-2 min-w-0 flex-1 truncate">
                <span
                  className={[
                    'mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full transition',
                    isOpen
                      ? 'bg-sky-500'
                      : 'bg-slate-300 group-hover:bg-slate-500',
                  ].join(' ')}
                />
                <span className="text-xs font-medium">
                  {isCollapsed ? compactLabel(item.label) : item.label}
                </span>
              </span>
              {!isCollapsed && <SidebarChevron isOpen={isOpen} />}
            </button>

            {isOpen && !isCollapsed && (
              <div className="ml-2 border-l border-sidebar-accent pl-2.5">
                <SidebarTree
                  items={item.children}
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                  isCollapsed={isCollapsed}
                  parentKey={getParentKey(parentKey, item.id)}
                  openByParent={openByParent}
                  collapsedByParent={collapsedByParent}
                  setOpenByParent={setOpenByParent}
                  setCollapsedByParent={setCollapsedByParent}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapsed,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tree: createdPages } = useMasterPages();
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [openByParent, setOpenByParent] = useState<Record<string, string>>({});
  const [collapsedByParent, setCollapsedByParent] = useState<
    Record<string, string>
  >({});

  const { data: menuTree = [], isLoading: isMenuTreeLoading } = useQuery({
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

  const sections = useMemo<SidebarSection[]>(() => {
    const dynamicSections = (menuTree || [])
      .map<SidebarSection>(root => {
        const rootItem = mapMenuNodeToItem(root);
        if (!rootItem) {
          return {
            title: root.name,
            items: [],
          } satisfies SidebarGroupSection;
        }

        if ('children' in rootItem) {
          return {
            title: rootItem.label,
            items: rootItem.children,
          } satisfies SidebarGroupSection;
        }

        return {
          title: rootItem.label,
          id: rootItem.id,
          label: rootItem.label,
          path: rootItem.path,
        } satisfies SidebarLeafSection;
      });

    const masterPagesSection: SidebarSection = {
      title: 'Master Pages',
      items: createdPages.map(mapMasterPageNodeToItem),
    };

    const nextSections = dynamicSections;

    return [...nextSections, masterPagesSection].filter(section =>
      isGroupSection(section) ? section.items.length > 0 : true
    );
  }, [createdPages, menuTree]);

  const activeSectionId = useMemo(() => {
    const firstOpenSection = sections.find(section =>
      isGroupSection(section)
        ? section.items.some(item => isMenuItemActive(item, location.pathname))
        : isPathActive(location.pathname, section.path)
    );

    return firstOpenSection?.title ?? sections[0]?.title ?? null;
  }, [location.pathname, sections]);

  const activeOpenByParent = useMemo(() => {
    const nextOpenByParent: Record<string, string> = {};

    const collectOpenGroups = (items: SidebarItem[], parentKey: string) => {
      for (const item of items) {
        if (!isGroupItem(item)) continue;

        if (isMenuItemActive(item, location.pathname)) {
          nextOpenByParent[parentKey] = item.id;
          collectOpenGroups(item.children, getParentKey(parentKey, item.id));
        }
      }
    };

    sections.forEach(section => {
      if (isGroupSection(section)) {
        collectOpenGroups(section.items, section.title);
      }
    });
    return nextOpenByParent;
  }, [location.pathname, sections]);

  const resolvedOpenByParent = useMemo(
    () => ({ ...activeOpenByParent, ...openByParent }),
    [activeOpenByParent, openByParent]
  );

  const resolvedCollapsedByParent = collapsedByParent;

  const handleMenuClick = (path?: string) => {
    if (path) {
      navigate(path);
    }

    onClose();
  };

  const handleLogoClick = () => {
    navigate('/');
    onClose();
  };

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 border-r border-slate-200 text-white transition-[width,transform] duration-300 ease-out',
        isCollapsed ? 'w-16' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{ backgroundColor: 'var(--color-sidebar-ink)' }}
    >
      <div className="flex h-full flex-col">
        <div
          className="relative flex items-center justify-between px-3 py-3.5"
          style={{ backgroundColor: 'var(--color-sidebar-ink)' }}
        >
          <button
            type="button"
            aria-label="Go to dashboard"
            className="flex min-w-0 cursor-pointer items-center gap-2.5 text-left transition hover:opacity-90"
            onClick={handleLogoClick}
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
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
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">
                  {company?.name ?? 'Maraekat FX'}
                </p>
              </div>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-1 py-1 text-slate-700 shadow-sm transition hover:bg-slate-50 lg:inline-flex"
              onClick={onToggleCollapsed}
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'}
                />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Close sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
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
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1.5">
            <button
              type="button"
              className={[
                'group flex w-full cursor-pointer items-center rounded-md text-left text-sm transition',
                isPathActive(location.pathname, '/')
                  ? 'bg-sidebar-accent text-white shadow-sm border-l-2 border-primary-500'
                  : 'bg-transparent text-sidebar-muted! hover:text-white!',
                isCollapsed
                  ? 'mx-auto h-10 w-10 justify-center rounded-full px-0'
                  : 'px-2.5 py-2.5',
              ].join(' ')}
              aria-current={isPathActive(location.pathname, '/') ? 'page' : undefined}
              onClick={() => handleMenuClick('/')}
              title="Dashboard"
            >
              <span className="flex min-w-0 items-center gap-2 truncate text-xs font-medium">
                {isCollapsed ? 'DB' : 'Dashboard'}
              </span>
            </button>

            {isMenuTreeLoading ? (
              <div className="flex min-h-[12rem] items-center justify-center px-3 py-6">
                <Loader />
              </div>
            ) : (
              sections.map(section => {
                if (isGroupSection(section)) {
                  const isOpen =
                    (openSectionId ?? activeSectionId) === section.title;
                  const isActiveSection = section.items.some(item =>
                    isMenuItemActive(item, location.pathname)
                  );

                  return (
                    <section key={section.title} className="space-y-0.5">
                      <button
                        type="button"
                        className={[
                          'group flex w-full cursor-pointer items-center justify-between rounded-md text-left text-sm font-medium transition',
                          isActiveSection
                            ? 'bg-sidebar-accent text-white shadow-sm border-l-2 border-primary-500'
                            : 'bg-transparent text-sidebar-muted! hover:text-white!',
                          isCollapsed
                            ? 'mx-auto h-10 w-10 justify-center rounded-full px-0'
                            : 'px-2.5 py-2.5',
                        ].join(' ')}
                        onClick={() =>
                          setOpenSectionId(prev =>
                            prev === section.title ? null : section.title
                          )
                        }
                        aria-expanded={isOpen}
                        title={section.title}
                      >
                        <span className="flex min-w-0 items-center gap-2 truncate text-xs font-medium">
                          {isCollapsed
                            ? compactLabel(section.title)
                            : section.title}
                        </span>
                        {!isCollapsed && (
                          <span className="text-slate-400">
                            <SidebarChevron isOpen={isOpen} />
                          </span>
                        )}
                      </button>

                      {isOpen && !isCollapsed && (
                        <div className="ml-2 border-l border-sidebar-accent pl-2 pt-1.5">
                          <SidebarTree
                            items={section.items}
                            currentPath={location.pathname}
                            onNavigate={handleMenuClick}
                            isCollapsed={isCollapsed}
                            parentKey={section.title}
                            openByParent={resolvedOpenByParent}
                            collapsedByParent={resolvedCollapsedByParent}
                            setOpenByParent={setOpenByParent}
                            setCollapsedByParent={setCollapsedByParent}
                          />
                        </div>
                      )}
                    </section>
                  );
                }

                const isActive = isPathActive(location.pathname, section.path);

                return (
                  <button
                    key={section.title}
                    type="button"
                    className={[
                      'group flex w-full cursor-pointer items-center rounded-md text-left text-sm transition',
                      isActive
                        ? 'bg-sidebar-accent text-white shadow-sm border-l-2 border-primary-500'
                        : 'bg-transparent text-sidebar-muted! hover:text-white!',
                      isCollapsed
                        ? 'mx-auto h-10 w-10 justify-center rounded-full px-0'
                        : 'px-2.5 py-2.5',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => handleMenuClick(section.path)}
                    title={section.title}
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate text-xs font-medium">
                      {isCollapsed
                        ? compactLabel(section.title)
                        : section.label}
                    </span>
                  </button>
                );
              })
            )}

            {createdPages.length > 0 && (
              <section className="space-y-0.5">
                {(() => {
                  const isMasterPagesActive = createdPages.some(page =>
                    isMenuItemActive(
                      mapMasterPageNodeToItem(page),
                      location.pathname
                    )
                  );

                  return (
                    <>
                      <button
                        type="button"
                        className={[
                          'group flex w-full cursor-pointer items-center justify-between rounded-md text-left text-sm transition',
                          isMasterPagesActive
                            ? 'bg-sidebar-accent text-white shadow-sm border-l-2 border-primary-500'
                            : 'bg-transparent text-sidebar-muted! hover:bg-slate-50 hover:text-sidebar-ink!',
                          isCollapsed
                            ? 'mx-auto h-10 w-10 justify-center rounded-full px-0'
                            : 'px-2.5 py-2.5',
                        ].join(' ')}
                        onClick={() =>
                          setOpenSectionId(prev =>
                            prev === 'Master Pages' ? null : 'Master Pages'
                          )
                        }
                        aria-expanded={
                          (openSectionId ?? activeSectionId) === 'Master Pages'
                        }
                        title="Master Pages"
                      >
                        <span className="flex min-w-0 items-center gap-2 truncate text-xs font-medium">
                          {isCollapsed
                            ? compactLabel('Master Pages')
                            : 'Master Pages'}
                        </span>
                        {!isCollapsed && (
                          <span className="text-slate-400">
                            <SidebarChevron
                              isOpen={
                                (openSectionId ?? activeSectionId) ===
                                'Master Pages'
                              }
                            />
                          </span>
                        )}
                      </button>

                      {(openSectionId ?? activeSectionId) === 'Master Pages' &&
                        !isCollapsed && (
                          <div className="ml-2 border-l border-sidebar-accent pl-2 pt-1.5">
                            <SidebarTree
                              items={createdPages.map(mapMasterPageNodeToItem)}
                              currentPath={location.pathname}
                              onNavigate={handleMenuClick}
                              isCollapsed={isCollapsed}
                              parentKey="Master Pages"
                              openByParent={resolvedOpenByParent}
                              collapsedByParent={resolvedCollapsedByParent}
                              setOpenByParent={setOpenByParent}
                              setCollapsedByParent={setCollapsedByParent}
                            />
                          </div>
                        )}
                    </>
                  );
                })()}
              </section>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
