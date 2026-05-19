import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy } from 'react';
import { Suspense } from 'react';
import { ProtectedLayout, PublicLayout } from '../components/layouts';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/login/LoginPage'));
const UserCreatePage = lazy(() => import('../pages/users/create/UserCreatePage'));
const UserListPage = lazy(() => import('../pages/users/list/UserListPage'));
const UserEditPage = lazy(() => import('../pages/users/edit/[id]/UserEditPage'));
const UserDetailPage = lazy(() => import('../pages/users/detail/[id]/UserDetailPage'));

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
    path: '/',
    element: (
      <ProtectedLayout>
        <UserListPage />
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
]);

export const AppRouter = () => {
  return (
    <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
