import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Produto } from '@/types/triagem';

export function useProdutos() {
  return useQuery({
    queryKey: queryKeys.produtos,
    queryFn: async () => {
      const { data } = await api.get<{ produtos: Produto[] }>('/produtos');

      return data.produtos;
    },
  });
}
