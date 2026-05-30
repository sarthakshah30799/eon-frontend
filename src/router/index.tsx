import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedLayout, PublicLayout } from '../components/layouts';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/login/LoginPage'));
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
    import('../pages/master/system-setups/company-profile/[id]/CompanyProfilePage')
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
    path: '/master/system-setups/company-profile/:id',
    element: (
      <ProtectedLayout>
        <CompanyProfilePage />
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
    <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
