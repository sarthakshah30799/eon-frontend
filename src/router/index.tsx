import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import {
  ProtectedLayout,
  PublicLayout,
} from '../components/layouts';
import { Loader } from '@/components/ui/loader';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/login/LoginPage'));
const ChooseWorkplacePage = lazy(
  () => import('../pages/auth/choose-workplace/ChooseWorkplacePage')
);
const ForgotPasswordPage = lazy(
  () => import('../pages/auth/forgot-password/ForgotPasswordPage')
);
const ResetPasswordPage = lazy(
  () => import('../pages/auth/reset-password/ResetPasswordPage')
);
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));

const UserCreatePage = lazy(
  () => import('../pages/users/create/UserCreatePage')
);
const UserListPage = lazy(() => import('../pages/users/list/UserListPage'));
const UserEditPage = lazy(
  () => import('../pages/users/edit/[id]/UserEditPage')
);
const UserDetailPage = lazy(
  () => import('../pages/users/detail/[id]/UserDetailPage')
);
const CompanyProfilePage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/list/CompanyProfileListPage')
);
const CompanyProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/create/CompanyProfileCreatePage')
);
const CompanyProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/edit/[id]/CompanyProfileEditPage')
);
const CountryProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/country-profile/list/CountryProfileListPage')
);
const CountryProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/country-profile/create/CountryProfileCreatePage')
);
const CountryProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/country-profile/edit/[id]/CountryProfileEditPage')
);
const StateProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/state-profile/list/StateProfileListPage')
);
const StateProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/state-profile/create/StateProfileCreatePage')
);
const StateProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/state-profile/edit/[id]/StateProfileEditPage')
);
const BranchProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/branch-profile/list/BranchProfileListPage')
);
const BranchProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/branch-profile/create/BranchProfileCreatePage')
);
const BranchProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/branch-profile/edit/[id]/BranchProfileEditPage')
);
const ProductProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/product-profile/list/ProductProfileListPage')
);
const ProductProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/product-profile/create/ProductProfileCreatePage')
);
const ProductProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/product-profile/edit/[id]/ProductProfileEditPage')
);
const CounterProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/counter-profile/list/CounterProfileListPage')
);
const CounterProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/counter-profile/create/CounterProfileCreatePage')
);
const CounterProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/counter-profile/edit/[id]/CounterProfileEditPage')
);
const CategoryOptionsListPage = lazy(
  () => import('../pages/admin/category-options/list')
);
const CategoryOptionsCreatePage = lazy(
  () => import('../pages/admin/category-options/create')
);
const CategoryOptionsEditPage = lazy(
  () => import('../pages/admin/category-options/edit/[id]')
);
const MenuPage = lazy(() => import('../pages/admin/menu/MenuPage'));
const AdditionalSettingsPage = lazy(
  () => import('../pages/admin/additional-settings')
);
const FinancialCodesListPage = lazy(
  () => import('../pages/admin/financial-codes/list')
);
const FinancialCodesCreatePage = lazy(
  () => import('../pages/admin/financial-codes/create')
);
const FinancialCodesEditPage = lazy(
  () => import('../pages/admin/financial-codes/edit/[id]')
);
const AccountsProfileListPage = lazy(
  () => import('../pages/admin/accounts-profile/list')
);
const AccountsProfileCreatePage = lazy(
  () => import('../pages/admin/accounts-profile/create')
);
const AccountsProfileEditPage = lazy(
  () => import('../pages/admin/accounts-profile/edit/[id]')
);
const MasterPagesPage = lazy(
  () => import('../pages/master/system-setups/master-pages/MasterPagesPage')
);
const UserProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/user-profile/list/UserProfileListPage')
);
const UserProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/user-profile/create/UserProfileCreatePage')
);
const UserProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/user-profile/edit/[id]/UserProfileEditPage')
);
const UserRoleListPage = lazy(
  () =>
    import('../pages/master/system-setups/user-role/list/UserRoleListPage')
);
const UserRoleCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/user-role/create/UserRoleCreatePage')
);
const UserRoleEditPage = lazy(
  () =>
    import('../pages/master/system-setups/user-role/edit/[id]/UserRoleEditPage')
);
const MasterPageResolverPage = lazy(
  () =>
    import('../pages/master/system-setups/master-pages/resolve/MasterPageResolverPage')
);

const CurrencyProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/currency-profile/list/CurrencyProfileListPage')
);
const CurrencyProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/currency-profile/create/CurrencyProfileCreatePage')
);
const CurrencyProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/currency-profile/edit/[id]/CurrencyProfileEditPage')
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    ),
  },
  {
    path: '/choose-workplace',
    element: <ChooseWorkplacePage />,
  },
  {
    path: '/forgot-password',
    element: (
      <PublicLayout>
        <ForgotPasswordPage />
      </PublicLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicLayout>
        <ResetPasswordPage />
      </PublicLayout>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedLayout>
        <DashboardPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/create',
    element: (
      <ProtectedLayout>
        <UserCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/list',
    element: (
      <ProtectedLayout>
        <UserListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/edit/:id',
    element: (
      <ProtectedLayout>
        <UserEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/:id',
    element: (
      <ProtectedLayout>
        <UserDetailPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/company-profile',
    element: (
      <ProtectedLayout>
        <CompanyProfilePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/company-profile/create',
    element: (
      <ProtectedLayout>
        <CompanyProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/company-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CompanyProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/branch-profile',
    element: (
      <ProtectedLayout>
        <BranchProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/branch-profile/create',
    element: (
      <ProtectedLayout>
        <BranchProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/branch-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <BranchProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/review/branch-profile',
    element: (
      <ProtectedLayout>
        <BranchProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/counter-profile',
    element: (
      <ProtectedLayout>
        <CounterProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/counter-profile/create',
    element: (
      <ProtectedLayout>
        <CounterProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/counter-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CounterProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/category-options',
    element: (
      <ProtectedLayout>
        <CategoryOptionsListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/category-options/create',
    element: (
      <ProtectedLayout>
        <CategoryOptionsCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/category-options/edit/:code',
    element: (
      <ProtectedLayout>
        <CategoryOptionsEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/menu-management',
    element: (
      <ProtectedLayout>
        <MenuPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/additional-settings',
    element: (
      <ProtectedLayout>
        <AdditionalSettingsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/financial-profile',
    element: (
      <ProtectedLayout>
        <FinancialCodesListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/financial-profile/create',
    element: (
      <ProtectedLayout>
        <FinancialCodesCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/financial-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <FinancialCodesEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/accounts-profile',
    element: (
      <ProtectedLayout>
        <AccountsProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/accounts-profile/create',
    element: (
      <ProtectedLayout>
        <AccountsProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/accounts-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <AccountsProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/country-profile',
    element: (
      <ProtectedLayout>
        <CountryProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/country-profile/create',
    element: (
      <ProtectedLayout>
        <CountryProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/country-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CountryProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/state-profile',
    element: (
      <ProtectedLayout>
        <StateProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/state-profile/create',
    element: (
      <ProtectedLayout>
        <StateProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/state-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <StateProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/product-profile',
    element: (
      <ProtectedLayout>
        <ProductProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/product-profile/create',
    element: (
      <ProtectedLayout>
        <ProductProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/product-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <ProductProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/currency-profile',
    element: (
      <ProtectedLayout>
        <CurrencyProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/currency-profile/create',
    element: (
      <ProtectedLayout>
        <CurrencyProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/currency-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CurrencyProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/master-pages',
    element: (
      <ProtectedLayout>
        <MasterPagesPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-profile',
    element: (
      <ProtectedLayout>
        <UserProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-profile/create',
    element: (
      <ProtectedLayout>
        <UserProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <UserProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-role',
    element: (
      <ProtectedLayout>
        <UserRoleListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-role/create',
    element: (
      <ProtectedLayout>
        <UserRoleCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-role/edit/:id',
    element: (
      <ProtectedLayout>
        <UserRoleEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '*',
    element: (
      <ProtectedLayout>
        <MasterPageResolverPage />
      </ProtectedLayout>
    ),
  },
]);

export const AppRouter = () => {
  return (
    <Suspense fallback={<div className="text-center py-4"><Loader /></div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
