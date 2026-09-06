import { ClienteDetalhe } from '@/components/crm/cliente-detalhe';
import { useTriagem } from '@/hooks/use-triagem';
import {
  estilosDeStatus,
  GRADIENTE_SEM_PRODUTO,
  iniciaisDe,
  PRODUTO_NAO_DEFINIDO,
  rotulosDeFiltro,
  type FiltroDeTriagem,
} from '@/lib/triagem';
import { cn } from '@/lib/utils';

const filtrosDisponiveis: FiltroDeTriagem[] = [
  'todos',
  'acao',
  'pendente',
  'limpo',
];

const gradeDaTabela =
  'grid grid-cols-[1.55fr_1fr_.95fr_.55fr] gap-2.5 px-[18px]';

export function Clientes() {
  const {
    clientesFiltrados,
    contagens,
    totalDeClientes,
    filtro,
    definirFiltro,
    busca,
    definirBusca,
    clienteSelecionado,
    selecionar,
    produtoDe,
  } = useTriagem();

  return (
    <div className="grid grid-cols-[1.45fr_.9fr] items-start gap-5">
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-line-soft px-[18px] py-[13px]">
          {filtrosDisponiveis.map((chave) => (
            <button
              key={chave}
              type="button"
              onClick={() => definirFiltro(chave)}
              className={cn(
                'cursor-pointer rounded-[20px] border px-3 py-1.5 text-[11.5px] font-bold',
                filtro === chave
                  ? 'border-brand-100 bg-brand-50 text-brand-600'
                  : 'border-line-muted bg-white text-ink-faint',
              )}
            >
              {rotulosDeFiltro[chave]}{' '}
              <span className="opacity-55">{contagens[chave]}</span>
            </button>
          ))}

          <div className="ml-auto text-[11.5px] font-semibold text-ink-dim">
            {clientesFiltrados.length} de {totalDeClientes} clientes
          </div>
        </div>

        <div
          className={cn(
            gradeDaTabela,
            'border-b border-line-soft bg-panel-muted py-2.5 text-[9.5px] font-extrabold tracking-[.6px] text-ink-dim uppercase',
          )}
        >
          <div>Cliente</div>
          <div>Produto / tese</div>
          <div>Análise n8n</div>
          <div>Docs</div>
        </div>

        <div>
          {clientesFiltrados.length === 0 && (
            <div className="px-[18px] py-14 text-center">
              <div className="text-sm font-bold text-ink-muted">
                {totalDeClientes === 0
                  ? 'Nenhum cliente na carteira ainda.'
                  : busca
                    ? `Nenhum cliente encontrado para “${busca}”.`
                    : 'Nenhum cliente para este filtro.'}
              </div>
              <div className="mt-1.5 text-xs text-ink-dim">
                {totalDeClientes === 0
                  ? 'Use “+ Novo cliente” para cadastrar o primeiro e enviá-lo à triagem.'
                  : busca
                    ? 'Verifique se digitou o nome, CPF ou número do benefício corretamente.'
                    : 'Ajuste a busca ou escolha outro filtro.'}
              </div>

              {busca && (
                <button
                  type="button"
                  onClick={() => definirBusca('')}
                  className="mt-3.5 cursor-pointer rounded-[9px] border border-line-strong bg-white px-3.5 py-1.5 text-xs font-bold text-ink-soft transition-colors hover:bg-panel-muted hover:text-ink"
                >
                  Limpar busca
                </button>
              )}
            </div>
          )}

          {clientesFiltrados.map((cliente) => {
            const estilo = estilosDeStatus[cliente.status];
            const produto = produtoDe(cliente);
            const selecionado = cliente.id === clienteSelecionado?.id;

            return (
              <div
                key={cliente.id}
                onClick={() => selecionar(cliente.id)}
                className={cn(
                  gradeDaTabela,
                  'cursor-pointer items-center border-b border-line-faint py-3',
                  selecionado
                    ? 'bg-panel-selected shadow-[inset_3px_0_0_#4f46e5]'
                    : 'bg-white',
                )}
              >
                <div className="flex min-w-0 items-center gap-[11px]">
                  <div
                    style={{
                      background: produto?.gradiente ?? GRADIENTE_SEM_PRODUTO,
                    }}
                    className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] text-[11.5px] font-extrabold text-white"
                  >
                    {iniciaisDe(cliente.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-ink">
                      {cliente.name}
                    </div>
                    <div className="mt-px text-[11px] text-ink-dim">
                      CPF {cliente.cpf}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span
                    className={cn(
                      'rounded-[7px] border px-[9px] py-1 text-[11px] leading-[1.2] font-bold',
                      produto
                        ? 'border-line-muted bg-line-faint text-ink-muted'
                        : 'border-dashed border-line-strong bg-white text-ink-pale',
                    )}
                  >
                    {produto?.name ?? PRODUTO_NAO_DEFINIDO}
                  </span>
                </div>

                <div className="flex items-center gap-[7px]">
                  <span
                    className={cn('size-2 shrink-0 rounded-full', estilo.dot)}
                  />
                  <span className={cn('text-[11.5px] font-bold', estilo.text)}>
                    {estilo.label}
                  </span>
                </div>

                <div className="flex items-center text-[11.5px] font-bold text-ink-faint">
                  {cliente.docs}/3
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ClienteDetalhe />
    </div>
  );
}
