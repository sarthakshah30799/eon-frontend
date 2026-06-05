import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BackButton } from '@/components/ui';
import { menuApi } from '@/api';
import type { ICreateMenu, IMenu } from '@/types/menuTypes';
import { MenuForm } from '../forms/MenuForm';
import { MENU_TEXTS } from '../constants/menuConstants';
import {
  buildParentMenuOptions,
  createEmptyMenuValues,
  mapMenuToCreateValues,
} from '../utils/menuUtils';
import { useCreateMenu } from '../hooks/useCreateMenu';
import { useDeleteMenu } from '../hooks/useDeleteMenu';
import { useUpdateMenu } from '../hooks/useUpdateMenu';

const MenuTreeRow = ({
  menu,
  depth = 0,
  onEdit,
  onDelete,
}: {
  menu: IMenu;
  depth?: number;
  onEdit: (menu: IMenu) => void;
  onDelete: (menu: IMenu) => void;
}) => {
  return (
    <li className="space-y-2">
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border-primary bg-surface-primary px-4 py-3"
        style={{ marginLeft: depth > 0 ? `${depth * 16}px` : 0 }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-text-primary">
              {menu.name}
            </p>
            <span
              className={[
                'rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em]',
                menu.isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              {menu.isActive ? 'Active' : 'Inactive'}
            </span>
            {menu.isAdmin && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-blue-700">
                Admin
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {menu.path || MENU_TEXTS.ROOT_LABEL} {menu.icon ? `| ${menu.icon}` : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-sm border border-border-primary px-3 py-1.5 text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
            onClick={() => onEdit(menu)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-sm border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
            onClick={() => onDelete(menu)}
          >
            Delete
          </button>
        </div>
      </div>

      {menu.children && menu.children.length > 0 && (
        <ul className="space-y-2">
          {menu.children
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
            .map(child => (
              <MenuTreeRow
                key={child.id}
                menu={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
        </ul>
      )}
    </li>
  );
};

export const MenuManagementView = () => {
  const [selectedMenu, setSelectedMenu] = useState<IMenu | null>(null);
  const { submitMenu, isPending: isCreating } = useCreateMenu();
  const { submitMenuUpdate, isPending: isUpdating } = useUpdateMenu();
  const { submitMenuDelete, isPending: isDeleting } = useDeleteMenu();

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const response = await menuApi.getMenus();
      return response.data ?? [];
    },
  });

  const { data: menuTree = [] } = useQuery({
    queryKey: ['menu-tree'],
    queryFn: async () => {
      const response = await menuApi.getMenuTree();
      return response.data ?? [];
    },
  });

  const parentOptions = useMemo(
    () => buildParentMenuOptions(menus, selectedMenu?.id),
    [menus, selectedMenu?.id]
  );

  const defaultValues = useMemo<ICreateMenu>(
    () =>
      selectedMenu ? mapMenuToCreateValues(selectedMenu) : createEmptyMenuValues(),
    [selectedMenu]
  );

  const handleSubmit = async (values: ICreateMenu) => {
    if (selectedMenu) {
      await submitMenuUpdate({ id: selectedMenu.id, values });
      setSelectedMenu(null);
      return;
    }

    await submitMenu(values);
    setSelectedMenu(null);
  };

  const handleDelete = async (menu: IMenu) => {
    const confirmed = window.confirm(
      `Delete menu "${menu.name}"? This will remove it from the sidebar.`
    );

    if (!confirmed) {
      return;
    }

    await submitMenuDelete(menu.id);

    if (selectedMenu?.id === menu.id) {
      setSelectedMenu(null);
    }
  };

  const isSubmitting = isCreating || isUpdating || isDeleting;

  return (
    <section className="space-y-6">
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            {selectedMenu && (
              <BackButton
                onClick={() => setSelectedMenu(null)}
                label="Back"
              />
            )}
          </div>

          <button
            type="button"
            className="rounded-sm border border-border-primary bg-surface-secondary px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-tertiary"
            onClick={() => setSelectedMenu(null)}
          >
            New Menu
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase text-text-tertiary">
                Current Menus
              </h2>
              <span className="text-xs text-text-secondary">
                {menus.length} total
              </span>
            </div>

            {isLoading || isUpdating ? (
              <p className="text-sm text-text-secondary">Loading menus...</p>
            ) : menuTree.length === 0 ? (
              <p className="text-sm text-text-secondary">{MENU_TEXTS.EMPTY_STATE}</p>
            ) : (
              <ul className="space-y-3">
                {menuTree
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                  .map(menu => (
                    <MenuTreeRow
                      key={menu.id}
                      menu={menu}
                      onEdit={setSelectedMenu}
                      onDelete={handleDelete}
                    />
                  ))}
              </ul>
            )}
          </div>

          <div className="relative rounded-sm border border-border-primary bg-surface-primary p-5">
            <div className="mb-5">
              <p className="text-sm leading-6 text-text-secondary">
                {selectedMenu
                  ? 'Update the selected menu and the sidebar will refresh after saving.'
                  : 'Create a new menu item to make it available in the dynamic sidebar.'}
              </p>
            </div>

            <MenuForm
              key={selectedMenu?.id ?? 'new-menu'}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              submitLabel={selectedMenu ? 'Update Menu' : MENU_TEXTS.SAVE_CHANGES}
              isSubmitting={isSubmitting}
              parentOptions={parentOptions}
            />

            {isUpdating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-sm bg-surface-primary/80 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-3 rounded-sm border border-border-primary bg-surface-primary px-5 py-4 shadow-lg">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                  <p className="text-sm font-medium text-text-secondary">
                    Updating menu...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuManagementView;
