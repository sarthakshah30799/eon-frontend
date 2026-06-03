import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedLayout, PublicLayout } from '../components/layouts';
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
const CategoryOptionsPage = lazy(
  () => import('../pages/admin/category-options/CategoryOptionsPage')
);
const MenuPage = lazy(() => import('../pages/admin/menu/MenuPage'));
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
        <CategoryOptionsPage />
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
    path: '/master/system-setups/country-profile',
    element: (
      <ProtectedLayout>
        <CountryProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/country-profile/create',
    element: (
      <ProtectedLayout>
        <CountryProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/country-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CountryProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/state-profile',
    element: (
      <ProtectedLayout>
        <StateProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/state-profile/create',
    element: (
      <ProtectedLayout>
        <StateProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/state-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <StateProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/product-profile',
    element: (
      <ProtectedLayout>
        <ProductProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/product-profile/create',
    element: (
      <ProtectedLayout>
        <ProductProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/product-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <ProductProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/currency-profile',
    element: (
      <ProtectedLayout>
        <CurrencyProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/currency-profile/create',
    element: (
      <ProtectedLayout>
        <CurrencyProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/currency-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CurrencyProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/master-pages',
    element: (
      <ProtectedLayout>
        <MasterPagesPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/user-profile',
    element: (
      <ProtectedLayout>
        <UserProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/user-profile/create',
    element: (
      <ProtectedLayout>
        <UserProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/user-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <UserProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/user-role',
    element: (
      <ProtectedLayout>
        <UserRoleListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/user-role/create',
    element: (
      <ProtectedLayout>
        <UserRoleCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/user-role/edit/:id',
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
