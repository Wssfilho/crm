import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { Dashboard } from '@/pages/dashboard';
import { NotFound } from '@/pages/not-found';
import { SignIn } from '@/pages/sign-in';
import { SignUp } from '@/pages/sign-up';
import { ProtectedRoute } from './protected-route';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [{ path: '/', element: <Dashboard /> }],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/sign-in', element: <SignIn /> },
      { path: '/sign-up', element: <SignUp /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
