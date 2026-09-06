import { Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTriagem } from '@/hooks/use-triagem';
import {
  formatarMoeda,
  GRADIENTE_SEM_PRODUTO,
  iniciaisDe,
  PRODUTO_NAO_DEFINIDO,
  rotuloDeSincronizacao,
} from '@/lib/triagem';
import { cn } from '@/lib/utils';

function PainelVazio({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-[22px] py-[30px] text-center">
      <div className="flex size-[54px] items-center justify-center rounded-[15px] border border-line-muted bg-line-faint text-2xl font-extrabold text-ink-ghost">
        —
      </div>

      <div className="max-w-[290px] text-sm leading-[1.45] font-extrabold text-ink-muted">
        {titulo}
      </div>
      <div className="max-w-[285px] text-xs leading-[1.55] text-ink-dim">
        {descricao}
      </div>

      {children}
    </div>
  );
}

export function ClienteDetalhe() {
  const {
    clienteSelecionado,
    produtos,
    produtoDe,
    marcarApto,
    arquivar,
    deletarCliente,
    abrirCsv,
    workflow,
    totalAnalisado,
    totalDeClientes,
  } = useTriagem();

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [fechandoModal, setFechandoModal] = useState(false);

  const fecharModalExclusao = () => {
    setFechandoModal(true);
    setTimeout(() => {
      setConfirmandoExclusao(false);
      setFechandoModal(false);
    }, 180);
  };

  const rodape = (
    <div className="flex items-center gap-2 border-t border-line-soft bg-panel-subtle px-[18px] py-3">
      <span
        className={cn(
          'size-[7px] shrink-0 rounded-full',
          workflow.ativo ? 'bg-green-500' : 'bg-amber-500',
        )}
      />
      <span className="text-[11px] font-semibold text-ink-faint">
        {rotuloDeSincronizacao(workflow, totalAnalisado, totalDeClientes)}
      </span>
    </div>
  );

  if (!clienteSelecionado) {
    return (
      <div className="sticky top-0 overflow-hidden rounded-2xl border border-line bg-white">
        <PainelVazio
          titulo={
            totalDeClientes === 0
              ? 'Nenhum cliente na carteira.'
              : 'Nenhum cliente selecionado.'
          }
          descricao={
            totalDeClientes === 0
              ? 'Cadastre um cliente para iniciar a triagem.'
              : 'Nenhum cliente corresponde aos critérios de busca ou filtro.'
          }
        />
        {rodape}
      </div>
    );
  }

  const produto = produtoDe(clienteSelecionado);

  const outrosProdutos = produtos
    .filter((item) => item.id !== clienteSelecionado.produtoId)
    .map((item) => item.name);

  return (
    <div className="sticky top-0 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-3 border-b border-line-soft px-[18px] py-4">
        <div
          style={{ background: produto?.gradiente ?? GRADIENTE_SEM_PRODUTO }}
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-extrabold text-white"
        >
          {iniciaisDe(clienteSelecionado.name)}
        </div>

        <div className="min-w-0">
          <div className="text-[14.5px] leading-[1.2] font-extrabold text-ink-strong">
            {clienteSelecionado.name}
          </div>
          <div className="mt-0.5 text-[11.5px] text-ink-faint">
            {clienteSelecionado.idade !== null &&
              `${clienteSelecionado.idade} anos · `}
            NB {clienteSelecionado.nb} · {produto?.name ?? PRODUTO_NAO_DEFINIDO}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfirmandoExclusao(true)}
          title="Excluir cliente"
          className="ml-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[9px] border border-line-strong bg-white text-ink-pale transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-[15px]" />
        </button>
      </div>

      {confirmandoExclusao && (
        <div
          onClick={fecharModalExclusao}
          className={cn(
            'fixed inset-0 z-55 flex items-center justify-center bg-[rgba(14,33,55,.55)] p-8 backdrop-blur-[2px]',
            fechandoModal ? 'animate-fade-out' : 'animate-fade-in',
          )}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={cn(
              'w-[min(420px,100%)] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)]',
              fechandoModal ? 'animate-modal-out' : 'animate-modal-pop',
            )}
          >
            <div className="px-[22px] pt-[22px] pb-4">
              <div className="text-[15px] font-extrabold text-ink-strong">
                Excluir cliente
              </div>
              <div className="mt-1.5 text-xs leading-[1.6] text-ink-faint">
                <strong className="text-ink">{clienteSelecionado.name}</strong>{' '}
                sai da carteira junto com as ações identificadas na triagem.
                Essa ação não pode ser desfeita.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-line-soft bg-panel-subtle px-[22px] py-4">
              <button
                type="button"
                onClick={fecharModalExclusao}
                className="cursor-pointer rounded-[11px] border border-line-strong bg-white px-4 py-[11px] text-[13px] font-bold text-ink-soft transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  fecharModalExclusao();
                  deletarCliente(clienteSelecionado);
                }}
                className="cursor-pointer rounded-[11px] bg-red-600 px-[18px] py-[11px] text-[13px] font-extrabold text-white shadow-sm transition-all duration-150 hover:bg-red-700 active:scale-[0.98]"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteSelecionado.status === 'ACAO' && (
        <div className="p-[18px]">
          <div className="flex items-start gap-[13px] rounded-[13px] border border-success-line bg-[linear-gradient(135deg,#f0fdf6,#eafaf1)] p-[15px]">
            <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#22c55e,#15925f)] text-[19px] font-extrabold text-white">
              !
            </div>

            <div>
              <div className="text-[10px] font-extrabold tracking-[.6px] text-green-700 uppercase">
                Irregularidade identificada
              </div>
              <div className="mt-1 text-[13.5px] leading-[1.45] font-bold text-ink-strong">
                Este produto tem capacidade de abrir as seguintes ações
                judiciais:
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex flex-col gap-2">
            {clienteSelecionado.acoes.map((acao, indice) => (
              <div
                key={acao.id}
                className="flex items-center gap-[11px] rounded-[11px] border border-brand-100 bg-panel-acao px-[13px] py-[11px]"
              >
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-[7px] bg-brand-50 text-[10.5px] font-extrabold text-brand-600">
                  {indice + 1}
                </span>

                <div>
                  <div className="text-[12.5px] leading-[1.3] font-bold text-ink">
                    {acao.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-dim">
                    {acao.base}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            <div className="rounded-[11px] border border-line-card p-3">
              <div className="text-[9.5px] font-extrabold tracking-[.5px] text-ink-pale uppercase">
                Contratos elegíveis
              </div>
              <div className="mt-[3px] text-xl font-extrabold tracking-[-.5px] text-ink-strong">
                {clienteSelecionado.contratos}
              </div>
            </div>

            <div className="rounded-[11px] border border-line-card p-3">
              <div className="text-[9.5px] font-extrabold tracking-[.5px] text-ink-pale uppercase">
                Valor estimado
              </div>
              <div className="mt-[3px] text-xl font-extrabold tracking-[-.5px] text-ink-strong">
                {formatarMoeda(clienteSelecionado.valorEmCentavos)}
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex gap-2.25">
            <button
              type="button"
              onClick={marcarApto}
              className="flex-1 cursor-pointer rounded-[11px] bg-[linear-gradient(135deg,#16a34a,#15803d)] p-3 text-[13px] font-extrabold text-white shadow-[0_8px_18px_-10px_rgba(22,163,74,.9)]"
            >
              Marcar como apto
            </button>

            <button
              type="button"
              onClick={abrirCsv}
              className="cursor-pointer rounded-[11px] border border-line-strong bg-white px-3.5 py-3 text-[12.5px] font-bold text-ink-soft"
            >
              Exportar
            </button>
          </div>

          <div className="mt-2.5 text-center text-[11px] leading-[1.5] text-ink-pale">
            A produção da peça ocorre fora do CRM nesta fase.
          </div>
        </div>
      )}

      {clienteSelecionado.status === 'LIMPO_PRODUTO' && (
        <PainelVazio
          titulo="Nenhum tipo de irregularidade foi encontrado para este produto."
          descricao="O cliente segue elegível para triagem em outros produtos da carteira."
        >
          <div className="mt-0.5 flex flex-wrap justify-center gap-2">
            {outrosProdutos.map((nome) => (
              <span
                key={nome}
                className="rounded-[20px] border border-brand-100 bg-brand-50 px-[11px] py-1.5 text-[11.5px] font-bold text-brand-600"
              >
                {nome}
              </span>
            ))}
          </div>
        </PainelVazio>
      )}

      {(clienteSelecionado.status === 'LIMPO_CLIENTE' ||
        clienteSelecionado.status === 'ARQUIVADO') && (
        <PainelVazio
          titulo="Nenhum tipo de irregularidade foi encontrado para este cliente."
          descricao="Todos os produtos da carteira foram varridos pelo fluxo n8n sem resultado positivo."
        >
          {clienteSelecionado.status === 'LIMPO_CLIENTE' && (
            <button
              type="button"
              onClick={arquivar}
              className="mt-1 cursor-pointer rounded-[10px] border border-line-strong bg-white px-4 py-2.5 text-[12.5px] font-bold text-ink-soft"
            >
              Arquivar triagem
            </button>
          )}
        </PainelVazio>
      )}

      {clienteSelecionado.status === 'PENDENTE' && (
        <div className="flex flex-col items-center gap-[13px] px-[22px] py-[34px] text-center">
          <div className="size-7 animate-spin rounded-full border-[3px] border-[#e2e6f5] border-t-brand-600" />

          <div className="text-[13.5px] font-extrabold text-ink-muted">
            Análise em execução no n8n
          </div>
          <div className="max-w-[275px] text-xs leading-[1.55] text-ink-dim">
            O workflow está lendo os extratos deste cliente. O resultado aparece
            aqui automaticamente.
          </div>
        </div>
      )}

      {rodape}
    </div>
  );
}
