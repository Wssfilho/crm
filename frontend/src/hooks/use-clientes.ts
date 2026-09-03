import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Cliente } from '@/types/triagem';

export function useClientes() {
  return useQuery({
    queryKey: queryKeys.clientes,
    queryFn: async () => {
      const { data } = await api.get<{ clientes: Cliente[] }>('/clientes');

      return data.clientes;
    },
  });
}
