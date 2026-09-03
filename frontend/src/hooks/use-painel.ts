import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Painel } from '@/types/triagem';

export function usePainel() {
  return useQuery({
    queryKey: queryKeys.painel,
    queryFn: async () => {
      const { data } = await api.get<Painel>('/painel');

      return data;
    },
  });
}
