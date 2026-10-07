import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { Clientes } from '@/pages/clientes';
import { Conta } from '@/pages/conta';
import { FeatureFutura } from '@/pages/feature-futura';
import { Kanban } from '@/pages/kanban';
import { NotFound } from '@/pages/not-found';
import { PainelN8n } from '@/pages/painel-n8n';
import { SignIn } from '@/pages/sign-in';
import { SignUp } from '@/pages/sign-up';
import { ProtectedRoute } from './protected-route';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Clientes /> },
          { path: '/kanban', element: <Kanban /> },
          { path: '/painel', element: <PainelN8n /> },
          { path: '/conta', element: <Conta /> },
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
