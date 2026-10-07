import { useQuery } from '@tanstack/react-query';
import type { AuthenticatedUser } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const { data } = await api.get<{ users: AuthenticatedUser[] }>('/users');

      return data.users;
    },
  });
}
