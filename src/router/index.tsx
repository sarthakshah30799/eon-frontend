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
const CompanyProfilePage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/[id]/CompanyProfilePage')
);
const MasterPagesPage = lazy(
  () => import('../pages/master/system-setups/master-pages/MasterPagesPage')
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
    path: '/master/system-setups/company-profile/:id',
    element: (
      <ProtectedLayout>
        <CompanyProfilePage />
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
