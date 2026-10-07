import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Usuario } from '@/types/triagem';

export function useUsuarios() {
  return useQuery({
    queryKey: queryKeys.usuarios,
    queryFn: async () => {
      const { data } = await api.get<{ usuarios: Usuario[] }>('/usuarios');

      return data.usuarios;
    },
  });
}
