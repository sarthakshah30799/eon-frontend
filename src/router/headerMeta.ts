import { matchPath } from 'react-router-dom';

export type HeaderMeta = {
  title: string;
};

const HEADER_ROUTES: Array<{ path: string; meta: HeaderMeta }> = [
  { path: '/', meta: { title: 'Dashboard' } },
  { path: '/users/list', meta: { title: 'Users' } },
  { path: '/users/create', meta: { title: 'Create User' } },
  { path: '/users/edit/:id', meta: { title: 'Edit User' } },
  { path: '/users/:id', meta: { title: 'User Details' } },
  { path: '/admin/company-profile', meta: { title: 'Company Profile' } },
  { path: '/admin/branch-profile', meta: { title: 'Branch Profile' } },
  {
    path: '/admin/branch-profile/create',
    meta: { title: 'Create Branch Profile' },
  },
  {
    path: '/admin/branch-profile/edit/:id',
    meta: { title: 'Edit Branch Profile' },
  },
  { path: '/admin/counter-profile', meta: { title: 'Counter Profile' } },
  {
    path: '/admin/counter-profile/create',
    meta: { title: 'Create Counter Profile' },
  },
  {
    path: '/admin/counter-profile/edit/:id',
    meta: { title: 'Edit Counter Profile' },
  },
  { path: '/admin/document-profile', meta: { title: 'Document Profile' } },
  {
    path: '/admin/document-profile/create',
    meta: { title: 'Create Document Profile' },
  },
  {
    path: '/admin/document-profile/edit/:id',
    meta: { title: 'Edit Document Profile' },
  },
  {
    path: '/admin/miscellaneous-profile',
    meta: { title: 'Miscellaneous Profile' },
  },
  {
    path: '/admin/miscellaneous-profile/create',
    meta: { title: 'Create Miscellaneous Profile' },
  },
  {
    path: '/admin/miscellaneous-profile/edit/:code',
    meta: { title: 'Edit Miscellaneous Profile' },
  },
  { path: '/admin/menu-management', meta: { title: 'Menu Management' } },
  { path: '/admin/additional-settings', meta: { title: 'Additional Settings' } },
  { path: '/mail-console', meta: { title: 'Mail Console' } },
  {
    path: '/admin/country-profile',
    meta: { title: 'Country Profile' },
  },
  {
    path: '/admin/country-profile/create',
    meta: { title: 'Create Country Profile' },
  },
  {
    path: '/admin/country-profile/edit/:id',
    meta: { title: 'Edit Country Profile' },
  },
  {
    path: '/admin/state-profile',
    meta: { title: 'State Profile' },
  },
  {
    path: '/admin/state-profile/create',
    meta: { title: 'Create State Profile' },
  },
  {
    path: '/admin/state-profile/edit/:id',
    meta: { title: 'Edit State Profile' },
  },
  {
    path: '/admin/product-profile',
    meta: { title: 'Product Profile' },
  },
  {
    path: '/admin/product-profile/create',
    meta: { title: 'Create Product Profile' },
  },
  {
    path: '/admin/product-profile/edit/:id',
    meta: { title: 'Edit Product Profile' },
  },
  {
    path: '/currency-profile',
    meta: { title: 'Currency Profile' },
  },
  {
    path: '/currency-profile/create',
    meta: { title: 'Create Currency Profile' },
  },
  {
    path: '/currency-profile/edit/:id',
    meta: { title: 'Edit Currency Profile' },
  },
  {
    path: '/admin/master-pages',
    meta: { title: 'Page Builder' },
  },
  {
    path: '/admin/user-profile',
    meta: { title: 'User Profile' },
  },
  {
    path: '/admin/user-profile/create',
    meta: { title: 'Create User Profile' },
  },
  {
    path: '/admin/user-profile/edit/:id',
    meta: { title: 'Edit User Profile' },
  },
  {
    path: '/admin/user-role',
    meta: { title: 'User Role' },
  },
  {
    path: '/admin/user-role/create',
    meta: { title: 'Create User Role' },
  },
  {
    path: '/admin/user-role/edit/:id',
    meta: { title: 'Edit User Role' },
  },
  {
    path: '/review/branch-profile',
    meta: { title: 'Branch Profile' },
  },
];

export const resolveHeaderMeta = (pathname: string): HeaderMeta => {
  for (const route of HEADER_ROUTES) {
    if (matchPath({ path: route.path, end: true }, pathname)) {
      return route.meta;
    }
  }

  return { title: 'Dashboard' };
};
