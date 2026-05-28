import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedLayout, PublicLayout } from '../components/layouts';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/login/LoginPage'));
const ForgotPasswordPage = lazy(
  () => import('../pages/auth/forgot-password/ForgotPasswordPage')
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
const CompanyProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/list/CompanyProfileListPage')
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
const RolesProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/roles-profile/list/RolesProfileListPage')
);
const RolesProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/roles-profile/create/RolesProfileCreatePage')
);
const RolesProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/roles-profile/edit/[id]/RolesProfileEditPage')
);
const MasterPageResolverPage = lazy(
  () =>
    import('../pages/master/system-setups/master-pages/resolve/MasterPageResolverPage')
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
    path: '/forgot-password',
    element: (
      <PublicLayout>
        <ForgotPasswordPage />
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
    path: '/master/system-setups/company-profile',
    element: (
      <ProtectedLayout>
        <CompanyProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/branch-profile',
    element: (
      <ProtectedLayout>
        <BranchProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/branch-profile/create',
    element: (
      <ProtectedLayout>
        <BranchProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/branch-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <BranchProfileEditPage />
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
    path: '/master/system-setups/roles-profile',
    element: (
      <ProtectedLayout>
        <RolesProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/roles-profile/create',
    element: (
      <ProtectedLayout>
        <RolesProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/master/system-setups/roles-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <RolesProfileEditPage />
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
    <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
