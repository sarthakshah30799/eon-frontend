import type { AsyncSelectOption } from '@/components/ui';
import type { ICreateMenu, IMenu } from '@/types/menuTypes';

export const normalizeMenuPath = (path: string): string => {
  const trimmed = path.trim();

  if (!trimmed) {
    return '';
  }

  const normalized = trimmed
    .split('/')
    .map(segment => segment.trim().toLowerCase().replace(/\s+/g, '-'))
    .join('/')
    .replace(/\/{2,}/g, '/');

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

export const createEmptyMenuValues = (): ICreateMenu => ({
  isAdmin: false,
  name: '',
  path: '',
  icon: '',
  parentId: null,
  sortOrder: 0,
  isActive: true,
});

export const mapMenuToCreateValues = (
  menu: IMenu
): ICreateMenu => ({
  isAdmin: menu.isAdmin,
  name: menu.name,
  path: menu.path ? normalizeMenuPath(menu.path) : '',
  icon: menu.icon ?? '',
  parentId: menu.parentId,
  sortOrder: menu.sortOrder,
  isActive: menu.isActive,
});

const collectDescendantIds = (
  menus: IMenu[],
  menuId: string
): Set<string> => {
  const descendants = new Set<string>();
  const stack = [menuId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId) continue;

    for (const menu of menus) {
      if (menu.parentId === currentId && !descendants.has(menu.id)) {
        descendants.add(menu.id);
        stack.push(menu.id);
      }
    }
  }

  return descendants;
};

export const buildParentMenuOptions = (
  menus: IMenu[],
  excludedMenuId?: string
): AsyncSelectOption[] => {
  const excludedIds = excludedMenuId
    ? new Set([excludedMenuId, ...collectDescendantIds(menus, excludedMenuId)])
    : new Set<string>();

  const childrenByParent = new Map<string | null, IMenu[]>();

  for (const menu of menus) {
    if (excludedIds.has(menu.id)) {
      continue;
    }

    const key = menu.parentId ?? null;
    const existing = childrenByParent.get(key) ?? [];
    existing.push(menu);
    childrenByParent.set(key, existing);
  }

  for (const items of childrenByParent.values()) {
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  const options: AsyncSelectOption[] = [];

  const walk = (parentId: string | null, depth: number) => {
    const children = childrenByParent.get(parentId) ?? [];

    for (const child of children) {
      const prefix = depth > 0 ? `${'  '.repeat(depth)}- ` : '';
      options.push({
        value: child.id,
        label: `${prefix}${child.name}${child.path ? ` (${child.path})` : ''}`,
      });
      walk(child.id, depth + 1);
    }
  };

  walk(null, 0);

  return options;
};
