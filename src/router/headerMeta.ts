import type { IMenu } from '@/types/menuTypes';

export type HeaderMeta = {
  title: string;
};

const normalizePath = (path: string) => {
  if (path === '/') return path;
  return path.replace(/\/+$/, '');
};

const stripActionSegment = (pathname: string) => {
  if (/\/create\/?$/.test(pathname)) {
    return pathname.replace(/\/create\/?$/, '');
  }

  if (/\/edit\/[^/]+\/?$/.test(pathname)) {
    return pathname.replace(/\/edit\/[^/]+\/?$/, '');
  }

  return pathname;
};

const matchesPath = (targetPath: string, pathname: string) => {
  const normalizedTarget = normalizePath(targetPath);
  const normalizedPathname = normalizePath(pathname);

  return (
    normalizedPathname === normalizedTarget ||
    normalizedPathname.startsWith(`${normalizedTarget}/`)
  );
};

const findMenuItemByPath = (items: IMenu[], pathname: string): IMenu | null => {
  for (const item of items) {
    const children = item.children ?? [];
    const nestedMatch = children.length > 0 ? findMenuItemByPath(children, pathname) : null;

    if (nestedMatch) {
      return nestedMatch;
    }

    if (item.path && matchesPath(item.path, pathname)) {
      return item;
    }
  }

  return null;
};

const getHeaderTitleFromPath = (pathname: string, menuTree: IMenu[]) => {
  if (pathname === '/') {
    return 'Dashboard';
  }

  const basePath = stripActionSegment(pathname);
  const matchedItem = findMenuItemByPath(menuTree, basePath);

  if (!matchedItem) {
    return 'Dashboard';
  }

  if (/\/create\/?$/.test(pathname)) {
    return `Create ${matchedItem.name}`;
  }

  if (/\/edit\/[^/]+\/?$/.test(pathname)) {
    return `Edit ${matchedItem.name}`;
  }

  return matchedItem.name;
};

export const resolveHeaderMeta = (
  pathname: string,
  menuTree: IMenu[] = []
): HeaderMeta => {
  return {
    title: getHeaderTitleFromPath(pathname, menuTree),
  };
};
