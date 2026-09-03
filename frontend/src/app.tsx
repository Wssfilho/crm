import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ToastViewport } from '@/components/ui/toast-viewport';
import { AuthProvider } from '@/contexts/auth-provider';
import { ToastProvider } from '@/contexts/toast-provider';
import { queryClient } from '@/lib/query-client';
import { router } from '@/routes/router';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <ToastViewport />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
