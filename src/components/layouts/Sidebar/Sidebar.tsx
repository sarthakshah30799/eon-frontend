import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '../../ui/dropdown';
import { useMasterPages } from '../../../lib';
import type { MasterPageTreeNode } from '../../../modules/masterPages/types';

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

const staticSections: SidebarSection[] = [
  {
    title: 'Master',
    items: [
      {
        id: 'master-profiles',
        label: 'Master Profiles',
        children: [
          { id: 'currency-profile', label: 'Currency Profile' },
          { id: 'accounts-profile', label: 'Accounts Profile' },
        ],
      },
      {
        id: 'system-setups',
        label: 'System setups',
        children: [
          {
            id: 'master-pages',
            label: 'Master Pages',
            path: '/master/system-setups/master-pages',
          },
          {
            id: 'company-profile',
            label: 'Company Profile',
            path: '/master/system-setups/company-profile/1',
          },
          {
            id: 'user-profile',
            label: 'User Profile',
            path: '/master/system-setups/user-profile',
          },
          {
            id: 'user-role',
            label: 'User Role',
            path: '/master/system-setups/user-role',
          },
        ],
      },
    ],
  },
  {
    title: 'Transactions',
    items: [
      {
        id: 'accounting-transaction',
        label: 'Accounting Transaction',
        children: [
          { id: 'receipt', label: 'Receipt' },
          { id: 'payment', label: 'Payment' },
        ],
      },
      {
        id: 'stock-transaction',
        label: 'Stock Transaction',
        children: [
          { id: 'receipt-of-stock', label: 'Receipt of Stock' },
          { id: 'return-of-stock', label: 'Return of Stock' },
        ],
      },
    ],
  },
];

const sidebarSectionTriggerClass =
  'w-full justify-between rounded-2xl border border-border-primary bg-surface-primary px-4 py-3 text-left text-sm font-semibold text-text-primary shadow-sm transition hover:border-primary-200 hover:bg-primary-50 focus-visible:ring-primary-300';

const sidebarSectionMenuClass =
  'w-72 overflow-visible rounded-2xl border border-border-primary bg-surface-primary p-2 shadow-lg ring-0';

const sidebarGroupTriggerClass = (level: number) =>
  [
    'w-full justify-between rounded-xl border border-border-primary bg-surface-secondary px-3 py-3 text-left text-sm font-semibold text-text-primary transition hover:border-primary-200 hover:bg-surface-primary focus-visible:ring-primary-300',
    level > 0 ? 'ml-2' : '',
  ].join(' ');

const sidebarGroupMenuClass = (level: number) =>
  [
    'w-64 overflow-visible rounded-xl border border-border-primary bg-surface-primary p-1 shadow-lg ring-0',
    level > 0 ? 'ml-2' : '',
  ].join(' ');

const sidebarLeafClass =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-primary-50 hover:text-text-primary';

const mapMasterPageNodeToItem = (page: MasterPageTreeNode): SidebarMenuItem => {
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

interface SidebarMenuListProps {
  items: SidebarMenuItem[];
  level?: number;
  onNavigate: (path?: string) => void;
}

const SidebarMenuList = ({
  items,
  level = 0,
  onNavigate,
}: SidebarMenuListProps) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  return (
    <ul className="space-y-2">
      {items.map(item => {
        if (isGroupItem(item)) {
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
                <Dropdown.Trigger className={sidebarGroupTriggerClass(level)}>
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
                  />
                </Dropdown.Menu>
              </Dropdown>
            </li>
          );
        }

        return (
          <li key={item.id}>
            <button
              type="button"
              className={sidebarLeafClass}
              onClick={() => onNavigate(item.path)}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
}

const SidebarTopLevelEntry = ({
  item,
  activeId,
  onOpenChange,
  onNavigate,
}: SidebarTopLevelEntryProps) => {
  if (isGroupItem(item)) {
    return (
      <Dropdown
        className="w-full"
        align="start"
        open={activeId === item.id}
        onOpenChange={nextOpen => {
          onOpenChange(nextOpen ? item.id : null);
        }}
      >
        <Dropdown.Trigger className={sidebarSectionTriggerClass}>
          {item.label}
        </Dropdown.Trigger>

        <Dropdown.Menu
          className={sidebarSectionMenuClass}
          placement="right"
          portal
          offset={12}
        >
          <SidebarMenuList items={item.children} onNavigate={onNavigate} />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <button
      type="button"
      className={sidebarSectionTriggerClass}
      onClick={() => onNavigate(item.path)}
    >
      {item.label}
    </button>
  );
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { tree: createdPages } = useMasterPages();
  const [openTopLevelId, setOpenTopLevelId] = useState<string | null>(null);

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
        'fixed inset-y-0 left-0 z-40 w-80 border-r border-border-primary bg-surface-secondary text-text-primary shadow-2xl transition-transform duration-300 ease-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border-primary bg-surface-primary px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700">
              <img src="/favicon.svg" alt="Maraekat logo" className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-text-tertiary">
                Currency Exchange
              </p>
              <p className="text-base font-semibold text-text-primary">
                Maraekat FX
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-surface-primary text-text-secondary transition hover:bg-primary-50 lg:hidden"
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
            {staticSections.map(section => (
              <section key={section.title} className="space-y-3">
                <Dropdown
                  className="w-full"
                  align="start"
                  open={openTopLevelId === section.title}
                  onOpenChange={nextOpen => {
                    setOpenTopLevelId(nextOpen ? section.title : null);
                  }}
                >
                  <Dropdown.Trigger className={sidebarSectionTriggerClass}>
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
