import { matchPath } from 'react-router-dom';
import type { IMenu } from '@/types/menuTypes';
import { formatPartyProfileLabel } from '@/modules/partyProfiles/constants';
import {
  getPurchasePageTitle,
  getPurchasePageTypeFromPath,
  getPurchasePageTypeFromSlug,
} from '@/pages/purchase/[slug]';

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
  {
    path: '/admin/company-profile/create',
    meta: { title: 'Create Company Profile' },
  },
  {
    path: '/admin/company-profile/edit/:id',
    meta: { title: 'Edit Company Profile' },
  },
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
  { path: '/reports/:slug', meta: { title: 'Reports' } },
  {
    path: '/admin/additional-settings',
    meta: { title: 'Additional Settings' },
  },
  {
    path: '/admin/transaction-account-postings',
    meta: { title: 'Transaction Account Postings' },
  },
  {
    path: '/admin/migrations',
    meta: { title: 'Migration Tool' },
  },
  { path: '/admin/currency-rates', meta: { title: 'Currency Rates' } },
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
  {
    path: '/expense-booking',
    meta: { title: 'Expense Booking Master' },
  },
  {
    path: '/expense-booking/create',
    meta: { title: 'Create Expense Booking Master' },
  },
  {
    path: '/expense-booking/edit/:id',
    meta: { title: 'Edit Expense Booking Master' },
  },
  {
    path: '/income-booking',
    meta: { title: 'Income Booking Master' },
  },
  {
    path: '/income-booking/create',
    meta: { title: 'Create Income Booking Master' },
  },
  {
    path: '/income-booking/edit/:id',
    meta: { title: 'Edit Income Booking Master' },
  },
  {
    path: '/admin/manual-bill-books',
    meta: { title: 'Manual Bill Books' },
  },
  {
    path: '/admin/manual-bill-books/create',
    meta: { title: 'Create Manual Bill Book' },
  },
  {
    path: '/manual-bill-books',
    meta: { title: 'Manual Bill Books' },
  },
  {
    path: '/manual-bill-books/create',
    meta: { title: 'Create Manual Bill Book' },
  },
  {
    path: '/manual-bill-books/acknowledgement',
    meta: { title: 'Branch Acknowledgement' },
  },
  {
    path: '/manual-bill-books/allocation',
    meta: { title: 'Manager To Cashier Allocation' },
  },
  {
    path: '/manual-bill-books/dp-mapping',
    meta: { title: 'Manual Bill DP Mapping' },
  },
  {
    path: '/manual-bill-books/dp-unmapping',
    meta: { title: 'Manual Bill DP Unmapping' },
  },
  {
    path: '/manual-bill-books/delivery-persons',
    meta: { title: 'Delivery Person Management' },
  },
  {
    path: '/admin/chequebooks',
    meta: { title: 'Cheque Books' },
  },
  {
    path: '/admin/chequebooks/create',
    meta: { title: 'Create Cheque Book' },
  },
  {
    path: '/cheque-books',
    meta: { title: 'Cheque Books' },
  },
  {
    path: '/cheque-books/create',
    meta: { title: 'Create Cheque Book' },
  },
  {
    path: '/cheque-books/acknowledgement',
    meta: { title: 'Cheque Book Acknowledgement' },
  },
  {
    path: '/cheque-books/allocation',
    meta: { title: 'Cheque Book Allocation' },
  },
  {
    path: '/cheque-books/return',
    meta: { title: 'Cheque Book Return' },
  },
  {
    path: '/chequebooks',
    meta: { title: 'Cheque Books' },
  },
  {
    path: '/chequebooks/create',
    meta: { title: 'Create Cheque Book' },
  },
  {
    path: '/chequebooks/acknowledgement',
    meta: { title: 'Cheque Book Acknowledgement' },
  },
  {
    path: '/chequebooks/allocation',
    meta: { title: 'Cheque Book Allocation' },
  },
  {
    path: '/purchase/:slug',
    meta: { title: 'Purchase' },
  },
  {
    path: '/sale/:slug',
    meta: { title: 'Sale' },
  },
  {
    path: '/purchase/:slug/create',
    meta: { title: 'Purchase' },
  },
  {
    path: '/sale/:slug/create',
    meta: { title: 'Sale' },
  },
  {
    path: '/purchase/:slug/edit/:id',
    meta: { title: 'Purchase' },
  },
  {
    path: '/sale/:slug/edit/:id',
    meta: { title: 'Sale' },
  },
  {
    path: '/party-profiles/:type/documents/:id',
    meta: {
      title: 'Party Profile Documents',
    },
  },
  {
    path: '/financial-profile',
    meta: {
      title: 'Financial Profile',
    },
  },
  {
    path: '/financial-profile/create',
    meta: {
      title: 'Create Financial Profile',
    },
  },
  {
    path: '/financial-profile/edit/:id',
    meta: {
      title: 'Edit Financial Profile',
    },
  },
  {
    path: '/admin/accounts-profile',
    meta: {
      title: 'Account Profile',
    },
  },
  {
    path: '/admin/accounts-profile/create',
    meta: {
      title: 'Create Account Profile',
    },
  },
  {
    path: '/admin/accounts-profile/edit/:id',
    meta: {
      title: 'Edit Account Profile',
    },
  },
  {
    path: '/user-profile',
    meta: {
      title: 'User Profile',
    },
  },
  {
    path: '/user-profile/create',
    meta: {
      title: 'Create User Profile',
    },
  },
  {
    path: '/user-profile/edit/:id',
    meta: {
      title: 'Edit User Profile',
    },
  },
  {
    path: '/admin/tds-profile',
    meta: {
      title: 'TDS Profile',
    },
  },
  {
    path: '/admin/tds-profile/create',
    meta: {
      title: 'Create TDS Profile',
    },
  },
  {
    path: '/admin/tds-profile/edit/:id',
    meta: {
      title: 'Edit TDS Profile',
    },
  },
];

const findMenuName = (nodes: IMenu[], pathname: string): string | null => {
  for (const node of nodes) {
    if (node.path && matchPath({ path: node.path, end: true }, pathname)) {
      return node.name;
    }
    if (node.children && node.children.length > 0) {
      const found = findMenuName(node.children, pathname);
      if (found) return found;
    }
  }
  return null;
};

export const resolveHeaderMeta = (
  pathname: string,
  menuTree?: IMenu[]
): HeaderMeta => {
  const cleanPathname =
    pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  const partyProfileRouteMatches = [
    { path: '/party-profiles/:type/documents/:id', kind: 'documents' as const },
    { path: '/party-profiles/:type/edit/:id', kind: 'edit' as const },
    { path: '/party-profiles/:type/create', kind: 'create' as const },
    { path: '/party-profiles/:type', kind: 'list' as const },
    { path: '/party-profiles', kind: 'list' as const },
  ];

  for (const route of partyProfileRouteMatches) {
    const matchedRoute = matchPath(
      { path: route.path, end: true },
      cleanPathname
    );

    if (!matchedRoute) continue;

    const partyType = matchedRoute.params.type
      ? formatPartyProfileLabel(matchedRoute.params.type)
      : '';

    switch (route.kind) {
      case 'documents':
        return {
          title: partyType
            ? `Party Profile Documents - ${partyType}`
            : 'Party Profile Documents',
        };
      case 'create':
        return {
          title: partyType
            ? `Create Party Profile - ${partyType}`
            : 'Create Party Profile',
        };
      case 'edit':
        return {
          title: partyType
            ? `Edit Party Profile - ${partyType}`
            : 'Edit Party Profile',
        };
      case 'list':
        return {
          title: partyType ? `Party Profiles - ${partyType}` : 'Party Profiles',
        };
    }
  }

  const purchaseRouteMatches = [
    { path: '/purchase/:slug/edit/:id', action: 'edit' as const },
    { path: '/purchase/:slug/create', action: 'create' as const },
    { path: '/purchase/:slug', action: 'view' as const },
    { path: '/sale/:slug/edit/:id', action: 'edit' as const },
    { path: '/sale/:slug/create', action: 'create' as const },
    { path: '/sale/:slug', action: 'view' as const },
  ];

  for (const route of purchaseRouteMatches) {
    const matchedRoute = matchPath(
      { path: route.path, end: true },
      cleanPathname
    );

    if (!matchedRoute) continue;

    const purchasePageType = getPurchasePageTypeFromPath(
      cleanPathname,
      matchedRoute.params.slug
    ) ?? getPurchasePageTypeFromSlug(matchedRoute.params.slug);

    const pageTitle = getPurchasePageTitle(purchasePageType);

    switch (route.action) {
      case 'edit':
        return {
          title: purchasePageType ? `Edit ${pageTitle}` : 'Edit Transaction',
        };
      case 'create':
        return {
          title: purchasePageType ? `Create ${pageTitle}` : 'Create Transaction',
        };
      case 'view':
        return {
          title: pageTitle,
        };
    }
  }

  for (const route of HEADER_ROUTES) {
    const cleanRoutePath =
      route.path.endsWith('/') && route.path !== '/'
        ? route.path.slice(0, -1)
        : route.path;
    const matchedRoute = matchPath({ path: cleanRoutePath, end: true }, cleanPathname);
    if (matchedRoute) {
      return route.meta;
    }
  }

  if (menuTree && menuTree.length > 0) {
    const name = findMenuName(menuTree, cleanPathname);
    if (name) {
      return { title: name };
    }
  }

  return { title: 'Dashboard' };
};
