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
  { path: '/admin/category-options', meta: { title: 'Category Options' } },
  {
    path: '/admin/category-options/create',
    meta: { title: 'Create Category Option' },
  },
  {
    path: '/admin/category-options/edit/:code',
    meta: { title: 'Edit Category Option' },
  },
  { path: '/admin/menu-management', meta: { title: 'Menu Management' } },
  { path: '/admin/additional-settings', meta: { title: 'Additional Settings' } },
  {
    path: '/master/system-setups/country-profile',
    meta: { title: 'Country Profile' },
  },
  {
    path: '/master/system-setups/country-profile/create',
    meta: { title: 'Create Country Profile' },
  },
  {
    path: '/master/system-setups/country-profile/edit/:id',
    meta: { title: 'Edit Country Profile' },
  },
  {
    path: '/master/system-setups/state-profile',
    meta: { title: 'State Profile' },
  },
  {
    path: '/master/system-setups/state-profile/create',
    meta: { title: 'Create State Profile' },
  },
  {
    path: '/master/system-setups/state-profile/edit/:id',
    meta: { title: 'Edit State Profile' },
  },
  {
    path: '/master/system-setups/product-profile',
    meta: { title: 'Product Profile' },
  },
  {
    path: '/master/system-setups/product-profile/create',
    meta: { title: 'Create Product Profile' },
  },
  {
    path: '/master/system-setups/product-profile/edit/:id',
    meta: { title: 'Edit Product Profile' },
  },
  {
    path: '/master/system-setups/currency-profile',
    meta: { title: 'Currency Profile' },
  },
  {
    path: '/master/system-setups/currency-profile/create',
    meta: { title: 'Create Currency Profile' },
  },
  {
    path: '/master/system-setups/currency-profile/edit/:id',
    meta: { title: 'Edit Currency Profile' },
  },
  {
    path: '/master/system-setups/master-pages',
    meta: { title: 'Page Builder' },
  },
  {
    path: '/master/system-setups/user-profile',
    meta: { title: 'User Profile' },
  },
  {
    path: '/master/system-setups/user-profile/create',
    meta: { title: 'Create User Profile' },
  },
  {
    path: '/master/system-setups/user-profile/edit/:id',
    meta: { title: 'Edit User Profile' },
  },
  {
    path: '/master/system-setups/user-role',
    meta: { title: 'User Role' },
  },
  {
    path: '/master/system-setups/user-role/create',
    meta: { title: 'Create User Role' },
  },
  {
    path: '/master/system-setups/user-role/edit/:id',
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
