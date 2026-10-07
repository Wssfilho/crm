import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '@/hooks/use-clientes';
import { usePainel } from '@/hooks/use-painel';
import { useProdutos } from '@/hooks/use-produtos';
import { useToast } from '@/hooks/use-toast';
import { useUsuarios } from '@/hooks/use-usuarios';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import {
  atendeABusca,
  atendeAoFiltro,
  type FiltroDeTriagem,
} from '@/lib/triagem';
import type {
  Cliente,
  ColunaKanban,
  EdicaoDeCliente,
  EtapaCliente,
  NovoCliente,
} from '@/types/triagem';
import {
  TriagemContext,
  type ContagensDeTriagem,
  type TriagemContextValue,
} from './triagem-context';

function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-ink-dim">
      {children}
    </div>
  );
}

export function TriagemProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mostrarToast } = useToast();

  const clientesQuery = useClientes();
  const produtosQuery = useProdutos();
  const painelQuery = usePainel();
  const usuariosQuery = useUsuarios();

  const [busca, definirBusca] = useState('');
  const [filtro, definirFiltro] = useState<FiltroDeTriagem>('todos');
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [csvAberto, setCsvAberto] = useState(false);
  const [novoAberto, setNovoAberto] = useState(false);

  const clientes = useMemo(
    () => clientesQuery.data ?? [],
    [clientesQuery.data],
  );

  const produtos = useMemo(
    () => produtosQuery.data ?? [],
    [produtosQuery.data],
  );

  const usuarios = useMemo(
    () => usuariosQuery.data ?? [],
    [usuariosQuery.data],
  );

  const invalidarClientes = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.clientes }),
    [queryClient],
  );

  /**
   * A lista aberta pode estar defasada: o registro já saiu do banco por outra
   * aba ou outra pessoa. Nesse caso o 404 não é falha da ação — é sinal de que
   * a tela precisa ressincronizar.
   */
  const tratarFalha = useCallback(
    (erro: unknown, mensagemDeFalha: string, mensagemDeSumico: string) => {
      if (isAxiosError(erro) && erro.response?.status === 404) {
        mostrarToast(mensagemDeSumico);
        void invalidarClientes();
        return;
      }

      mostrarToast(mensagemDeFalha);
    },
    [invalidarClientes, mostrarToast],
  );

  const { mutate: marcarAptoRequest } = useMutation({
    mutationFn: (clienteId: string) => api.patch(`/clientes/${clienteId}/apto`),
    onSuccess: invalidarClientes,
    onError: (erro) =>
      tratarFalha(
        erro,
        'Não foi possível marcar como apto.',
        'Esse cliente já não está mais na carteira.',
      ),
  });

  const { mutate: moverColunaRequest } = useMutation({
    mutationFn: ({
      clienteId,
      coluna,
    }: {
      clienteId: string;
      coluna: ColunaKanban;
    }) => api.patch(`/clientes/${clienteId}/coluna`, { coluna }),
    onMutate: async ({ clienteId, coluna }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clientes });

      const previousClientes = queryClient.getQueryData<Cliente[]>(
        queryKeys.clientes,
      );

      if (previousClientes) {
        queryClient.setQueryData<Cliente[]>(
          queryKeys.clientes,
          previousClientes.map((cliente) =>
            cliente.id === clienteId ? { ...cliente, coluna } : cliente,
          ),
        );
      }

      return { previousClientes };
    },
    onError: (erro, _variables, context) => {
      if (context?.previousClientes) {
        queryClient.setQueryData(queryKeys.clientes, context.previousClientes);
      }

      tratarFalha(
        erro,
        'Não foi possível mover o cliente.',
        'Esse cliente já não está mais na carteira.',
      );
    },
    onSettled: () => {
      void invalidarClientes();
    },
  });

  const { mutate: moverEtapaRequest } = useMutation({
    mutationFn: ({
      clienteId,
      etapa,
    }: {
      clienteId: string;
      etapa: EtapaCliente;
    }) => api.patch(`/clientes/${clienteId}/etapa`, { etapa }),
    onMutate: async ({ clienteId, etapa }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.clientes });

      const previousClientes = queryClient.getQueryData<Cliente[]>(
        queryKeys.clientes,
      );

      if (previousClientes) {
        queryClient.setQueryData<Cliente[]>(
          queryKeys.clientes,
          previousClientes.map((cliente) =>
            cliente.id === clienteId ? { ...cliente, etapa } : cliente,
          ),
        );
      }

      return { previousClientes };
    },
    onError: (erro, _variables, context) => {
      if (context?.previousClientes) {
        queryClient.setQueryData(queryKeys.clientes, context.previousClientes);
      }

      tratarFalha(
        erro,
        'Não foi possível mover o cliente.',
        'Esse cliente já não está mais na carteira.',
      );
    },
    onSettled: () => {
      void invalidarClientes();
    },
  });

  const { mutate: editarClienteRequest, isPending: editando } = useMutation({
    mutationFn: ({
      clienteId,
      dados,
    }: {
      clienteId: string;
      dados: EdicaoDeCliente;
    }) => api.patch(`/clientes/${clienteId}`, dados),
    onSuccess: invalidarClientes,
  });

  const { mutate: arquivarRequest } = useMutation({
    mutationFn: (clienteId: string) =>
      api.patch(`/clientes/${clienteId}/arquivar`),
    onSuccess: invalidarClientes,
    onError: (erro) =>
      tratarFalha(
        erro,
        'Não foi possível arquivar a triagem.',
        'Esse cliente já não está mais na carteira.',
      ),
  });

  const { mutate: criarClienteRequest, isPending: salvando } = useMutation({
    mutationFn: (dados: NovoCliente) => api.post('/clientes', dados),
    onSuccess: invalidarClientes,
  });

  const { mutate: deletarClienteRequest } = useMutation({
    mutationFn: (clienteId: string) => api.delete(`/clientes/${clienteId}`),
    onSuccess: invalidarClientes,
    onError: (erro) =>
      tratarFalha(
        erro,
        'Não foi possível excluir o cliente.',
        'Esse cliente já tinha sido excluído.',
      ),
  });

  const { mutate: alternarWorkflowRequest } = useMutation({
    mutationFn: () => api.patch('/painel/workflow'),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.painel }),
    onError: () => mostrarToast('Não foi possível alterar a sincronização.'),
  });

  const contagens = useMemo<ContagensDeTriagem>(() => {
    const acao = clientes.filter((cliente) => cliente.status === 'ACAO').length;

    const pendente = clientes.filter(
      (cliente) => cliente.status === 'PENDENTE',
    ).length;

    return {
      todos: clientes.length,
      acao,
      pendente,
      limpo: clientes.length - acao - pendente,
    };
  }, [clientes]);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim();

    return clientes.filter(
      (cliente) =>
        atendeAoFiltro(cliente.status, filtro) &&
        atendeABusca(cliente, termo, produtos),
    );
  }, [busca, clientes, filtro, produtos]);

  const totalAnalisado = useMemo(
    () => clientes.filter((cliente) => cliente.status !== 'PENDENTE').length,
    [clientes],
  );

  const clienteSelecionado = useMemo(
    () =>
      clientesFiltrados.find((cliente) => cliente.id === selecionadoId) ??
      clientesFiltrados[0],
    [clientesFiltrados, selecionadoId],
  );

  const produtoDe = useCallback(
    (cliente: Cliente) =>
      produtos.find((produto) => produto.id === cliente.produtoId),
    [produtos],
  );

  const selecionar = useCallback(
    (id: string) => {
      setSelecionadoId(id);
      navigate('/');
    },
    [navigate],
  );

  const marcarApto = useCallback(() => {
    if (!clienteSelecionado) {
      return;
    }

    marcarAptoRequest(clienteSelecionado.id);

    const primeiroNome = clienteSelecionado.name.split(' ')[0];

    mostrarToast(`${primeiroNome} movido para “Apto para ação”.`);
  }, [clienteSelecionado, marcarAptoRequest, mostrarToast]);

  const moverColuna = useCallback(
    (clienteId: string, coluna: ColunaKanban) => {
      moverColunaRequest({ clienteId, coluna });
    },
    [moverColunaRequest],
  );

  const usuarioDe = useCallback(
    (id: string | null) => usuarios.find((usuario) => usuario.id === id),
    [usuarios],
  );

  const moverEtapa = useCallback(
    (clienteId: string, etapa: EtapaCliente) => {
      moverEtapaRequest({ clienteId, etapa });
    },
    [moverEtapaRequest],
  );

  const editarCliente = useCallback(
    (clienteId: string, dados: EdicaoDeCliente, aoConcluir: () => void) => {
      editarClienteRequest(
        { clienteId, dados },
        {
          onSuccess: () => {
            aoConcluir();
            mostrarToast('Cliente atualizado.');
          },
          onError: (erro) =>
            tratarFalha(
              erro,
              'Não foi possível salvar as alterações.',
              'Esse cliente ou o responsável escolhido não existe mais.',
            ),
        },
      );
    },
    [editarClienteRequest, mostrarToast, tratarFalha],
  );

  const arquivar = useCallback(() => {
    if (!clienteSelecionado) {
      return;
    }

    arquivarRequest(clienteSelecionado.id);
    mostrarToast('Triagem arquivada.');
  }, [clienteSelecionado, arquivarRequest, mostrarToast]);

  const workflow = painelQuery.data?.workflow;

  const alternarWorkflow = useCallback(() => {
    if (!workflow) {
      return;
    }

    alternarWorkflowRequest();

    mostrarToast(
      workflow.ativo ? 'Sincronização pausada.' : 'Sincronização retomada.',
    );
  }, [workflow, alternarWorkflowRequest, mostrarToast]);

  const deletarCliente = useCallback(
    (cliente: Cliente) => {
      deletarClienteRequest(cliente.id, {
        onSuccess: () => {
          setSelecionadoId(null);
          mostrarToast(`${cliente.name} foi excluído da carteira.`);
        },
      });
    },
    [deletarClienteRequest, mostrarToast],
  );

  const abrirNovo = useCallback(() => setNovoAberto(true), []);
  const fecharNovo = useCallback(() => setNovoAberto(false), []);

  const criarCliente = useCallback(
    (dados: NovoCliente, aoConcluir: () => void) => {
      criarClienteRequest(dados, {
        onSuccess: () => {
          setNovoAberto(false);
          aoConcluir();

          mostrarToast(`${dados.name} entrou em Comercial.`);
        },
        onError: (erro) => {
          const conflito = isAxiosError(erro) && erro.response?.status === 409;

          mostrarToast(
            conflito
              ? 'Já existe um cliente com esse CPF.'
              : 'Não foi possível salvar o cliente.',
          );
        },
      });
    },
    [criarClienteRequest, mostrarToast],
  );

  const abrirCsv = useCallback(() => setCsvAberto(true), []);
  const fecharCsv = useCallback(() => setCsvAberto(false), []);

  const confirmarCsv = useCallback(() => {
    setCsvAberto(false);
    mostrarToast(`${clientesFiltrados.length} clientes exportados em CSV.`);
  }, [clientesFiltrados.length, mostrarToast]);

  const value = useMemo<TriagemContextValue | null>(() => {
    if (!workflow) {
      return null;
    }

    return {
      busca,
      definirBusca,
      filtro,
      definirFiltro,
      clientes,
      clientesFiltrados,
      contagens,
      totalDeClientes: clientes.length,
      totalAnalisado,
      produtos,
      produtoDe,
      clienteSelecionado,
      selecionar,
      marcarApto,
      moverColuna,
      usuarios,
      usuarioDe,
      moverEtapa,
      editarCliente,
      editando,
      arquivar,
      deletarCliente,
      novoAberto,
      abrirNovo,
      fecharNovo,
      criarCliente,
      salvando,
      execucoes: painelQuery.data?.execucoes ?? [],
      workflow,
      alternarWorkflow,
      csvAberto,
      abrirCsv,
      fecharCsv,
      confirmarCsv,
    };
  }, [
    busca,
    filtro,
    clientes,
    clientesFiltrados,
    contagens,
    totalAnalisado,
    produtos,
    produtoDe,
    clienteSelecionado,
    selecionar,
    marcarApto,
    moverColuna,
    usuarios,
    usuarioDe,
    moverEtapa,
    editarCliente,
    editando,
    arquivar,
    deletarCliente,
    novoAberto,
    abrirNovo,
    fecharNovo,
    criarCliente,
    salvando,
    painelQuery.data,
    workflow,
    alternarWorkflow,
    csvAberto,
    abrirCsv,
    fecharCsv,
    confirmarCsv,
  ]);

  const carregando =
    clientesQuery.isPending || produtosQuery.isPending || painelQuery.isPending;

  if (carregando) {
    return <Aviso>Carregando a carteira...</Aviso>;
  }

  if (!value) {
    return (
      <Aviso>
        Não foi possível carregar os dados da triagem. Verifique se a API está
        no ar.
      </Aviso>
    );
  }

  return (
    <TriagemContext.Provider value={value}>{children}</TriagemContext.Provider>
  );
}
