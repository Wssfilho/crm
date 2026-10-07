import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { Andamento } from '@/pages/andamento';
import { Conta } from '@/pages/conta';
import { Equipe } from '@/pages/equipe';
import { FeatureFutura } from '@/pages/feature-futura';
import { NotFound } from '@/pages/not-found';
import { SignIn } from '@/pages/sign-in';
import { SignUp } from '@/pages/sign-up';
import { AdminRoute } from './admin-route';
import { ProtectedRoute } from './protected-route';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Andamento /> },
          { path: '/conta', element: <Conta /> },
          {
            element: <AdminRoute />,
            children: [{ path: '/equipe', element: <Equipe /> }],
          },
          { path: '/em-breve/:feature', element: <FeatureFutura /> },
        ],
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
