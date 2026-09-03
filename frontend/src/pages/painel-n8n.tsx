import { NumeroAnimado } from '@/components/ui/numero-animado';
import { useEntradaAnimada } from '@/hooks/use-entrada-animada';
import { useTriagem } from '@/hooks/use-triagem';
import { useValorAnimado } from '@/hooks/use-valor-animado';
import { diaDoMes, rotuloDeSincronizacao } from '@/lib/triagem';
import { cn } from '@/lib/utils';

/** Altura, em pixels, de uma unidade da barra do gráfico de execuções. */
const alturaDaUnidadeEmPixels = 13;

/** Atraso, em milissegundos, entre a entrada de uma barra e a seguinte. */
const atrasoEntreBarrasEmMs = 45;

const cartao = 'rounded-2xl border border-line bg-white';
const rotuloDeKpi =
  'text-[9.5px] font-extrabold uppercase tracking-[.6px] text-ink-pale';

export function PainelN8n() {
  const {
    clientes,
    produtos,
    contagens,
    totalDeClientes,
    totalAnalisado,
    execucoes,
    workflow,
    alternarWorkflow,
  } = useTriagem();

  const entrou = useEntradaAnimada();

  const baseDoPercentual = Math.max(totalDeClientes, 1);

  const percentualAnalisado = Math.round(
    (totalAnalisado / baseDoPercentual) * 100,
  );

  const anguloComAcao = (contagens.acao / baseDoPercentual) * 360;
  const anguloSemIrregularidade =
    anguloComAcao + (contagens.limpo / baseDoPercentual) * 360;

  const anguloComAcaoAnimado = useValorAnimado(anguloComAcao);
  const anguloSemIrregularidadeAnimado = useValorAnimado(
    anguloSemIrregularidade,
  );

  const donut = `conic-gradient(#4f46e5 0deg ${anguloComAcaoAnimado}deg, #94a3b4 ${anguloComAcaoAnimado}deg ${anguloSemIrregularidadeAnimado}deg, #dde4ec ${anguloSemIrregularidadeAnimado}deg 360deg)`;

  const kpis = [
    {
      label: 'Clientes na carteira',
      value: totalDeClientes,
      delta: '+3 nesta semana',
      deltaClass: 'text-status-acao',
    },
    {
      label: 'Analisados no n8n',
      value: totalAnalisado,
      delta: `${percentualAnalisado}% da carteira`,
      deltaClass: 'text-ink-faint',
    },
    {
      label: 'Com ação viável',
      value: contagens.acao,
      delta: `${Math.round((contagens.acao / Math.max(totalAnalisado, 1)) * 100)}% de aproveitamento`,
      deltaClass: 'text-status-acao',
    },
    {
      label: 'Aguardando análise',
      value: contagens.pendente,
      delta: contagens.pendente > 0 ? 'fila ativa' : 'fila vazia',
      deltaClass: 'text-amber-700',
    },
  ];

  const legendaDoDonut = [
    { label: 'Com ação', value: contagens.acao, color: '#4f46e5' },
    { label: 'Sem irregularidade', value: contagens.limpo, color: '#94a3b4' },
    { label: 'Aguardando', value: contagens.pendente, color: '#dde4ec' },
  ];

  const coberturaPorProduto = produtos.map((produto) => {
    const daCarteira = clientes.filter(
      (cliente) => cliente.produtoId === produto.id,
    );

    const analisados = daCarteira.filter(
      (cliente) => cliente.status !== 'PENDENTE',
    ).length;

    const percentual = daCarteira.length
      ? Math.round((analisados / daCarteira.length) * 100)
      : 0;

    return { produto, analisados, total: daCarteira.length, percentual };
  });

  return (
    <div className="flex flex-col gap-[18px]">
      <div
        className={cn(cartao, 'flex items-center gap-[13px] px-[18px] py-3.5')}
      >
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-ink-strong text-[10.5px] font-extrabold text-white">
          n8n
        </div>

        <div>
          <div className="text-[13px] font-bold text-ink">
            Workflow{' '}
            <span className="font-mono text-xs text-brand-600">
              {workflow.nome}
            </span>
          </div>
          <div className="mt-px text-[11.5px] text-ink-dim">
            {rotuloDeSincronizacao(workflow, totalAnalisado, totalDeClientes)}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-[9px]">
          <span
            className={cn(
              'flex items-center gap-[7px] rounded-[20px] px-3 py-1.5 text-[11.5px] font-extrabold',
              workflow.ativo
                ? 'bg-success-chip text-green-700'
                : 'bg-amber-100 text-amber-700',
            )}
          >
            <span
              className={cn(
                'size-[7px] rounded-full',
                workflow.ativo ? 'bg-green-500' : 'bg-amber-500',
              )}
            />
            {workflow.ativo ? 'Conectado' : 'Pausado'}
          </span>

          <button
            type="button"
            onClick={alternarWorkflow}
            className="h-[34px] cursor-pointer rounded-[9px] border border-line-strong bg-white px-3.5 text-xs font-bold text-ink-soft"
          >
            {workflow.ativo ? 'Pausar' : 'Retomar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cn(cartao, 'px-[17px] py-4')}>
            <div className={rotuloDeKpi}>{kpi.label}</div>
            <div className="mt-1.5 text-[28px] leading-none font-extrabold tracking-[-1px] text-ink-strong">
              <NumeroAnimado valor={kpi.value} />
            </div>
            <div
              className={cn(
                'mt-1.5 text-[11.5px] font-semibold',
                kpi.deltaClass,
              )}
            >
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[.8fr_1.2fr] items-start gap-[18px]">
        <div className={cn(cartao, 'px-5 py-[18px]')}>
          <div className="text-sm font-extrabold text-ink-strong">
            Clientes processados
          </div>
          <div className="mt-0.5 text-xs text-ink-dim">
            Já rodados no n8n vs. pendentes
          </div>

          <div className="mt-[18px] flex items-center gap-5">
            <div
              style={{ background: donut }}
              className="flex size-32 shrink-0 items-center justify-center rounded-full"
            >
              <div className="flex size-[88px] flex-col items-center justify-center rounded-full bg-white">
                <div className="text-[23px] leading-none font-extrabold tracking-[-.8px] text-ink-strong">
                  <NumeroAnimado valor={percentualAnalisado} sufixo="%" />
                </div>
                <div className="mt-0.5 text-[9px] font-extrabold tracking-[.4px] text-ink-pale uppercase">
                  Processados
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[11px]">
              {legendaDoDonut.map((item) => (
                <div key={item.label} className="flex items-center gap-[9px]">
                  <span
                    style={{ background: item.color }}
                    className="size-[11px] shrink-0 rounded-[3px]"
                  />
                  <span className="min-w-[110px] text-xs font-bold text-ink-muted">
                    {item.label}
                  </span>
                  <span className="text-xs font-extrabold text-ink-strong">
                    <NumeroAnimado valor={item.value} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={cn(cartao, 'px-5 py-[18px]')}>
          <div className="flex items-end gap-3">
            <div>
              <div className="text-sm font-extrabold text-ink-strong">
                Execuções por dia
              </div>
              <div className="mt-0.5 text-xs text-ink-dim">
                Últimos 10 dias · clientes analisados
              </div>
            </div>

            <div className="ml-auto flex gap-3.5">
              <div className="flex items-center gap-[7px]">
                <span className="size-2.5 rounded-[3px] bg-brand-600" />
                <span className="text-[11px] font-bold text-ink-faint">
                  Com ação
                </span>
              </div>
              <div className="flex items-center gap-[7px]">
                <span className="size-2.5 rounded-[3px] bg-slate-300" />
                <span className="text-[11px] font-bold text-ink-faint">
                  Sem irregularidade
                </span>
              </div>
            </div>
          </div>

          <div className="mt-[18px] flex h-[172px] items-end gap-2.5 border-b border-line-muted">
            {execucoes.map((execucao, indice) => (
              <div
                key={execucao.id}
                className="flex flex-1 flex-col justify-end gap-[3px]"
              >
                <div
                  style={{
                    height: entrou
                      ? execucao.comAcao * alturaDaUnidadeEmPixels
                      : 0,
                    transitionDelay: `${indice * atrasoEntreBarrasEmMs}ms`,
                  }}
                  className="rounded-t-[4px] bg-brand-600 transition-[height] duration-700 ease-out motion-reduce:transition-none"
                />
                <div
                  style={{
                    height: entrou
                      ? execucao.semIrregularidade * alturaDaUnidadeEmPixels
                      : 0,
                    transitionDelay: `${indice * atrasoEntreBarrasEmMs}ms`,
                  }}
                  className="rounded-b-[3px] bg-slate-300 transition-[height] duration-700 ease-out motion-reduce:transition-none"
                />
              </div>
            ))}
          </div>

          <div className="mt-[7px] flex gap-2.5">
            {execucoes.map((execucao) => (
              <div
                key={execucao.id}
                className="flex-1 text-center text-[10px] font-bold text-ink-ghost"
              >
                {diaDoMes(execucao.data)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(cartao, 'overflow-hidden')}>
        <div className="flex items-center gap-3 border-b border-line-soft px-5 py-[15px]">
          <div className="text-sm font-extrabold text-ink-strong">
            Cobertura por produto
          </div>
          <div className="text-xs text-ink-dim">
            quantos clientes da carteira já passaram pela análise
          </div>
        </div>

        <div className="px-5 pt-2 pb-[18px]">
          {coberturaPorProduto.map(
            ({ produto, analisados, total, percentual }, indice) => (
              <div
                key={produto.id}
                className="grid grid-cols-[200px_1fr_120px] items-center gap-4 border-b border-line-faint py-[13px]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    style={{ background: produto.gradiente }}
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold text-white"
                  >
                    {produto.mono}
                  </span>
                  <span className="text-[12.5px] font-bold text-ink">
                    {produto.name}
                  </span>
                </div>

                <div className="h-[9px] overflow-hidden rounded-[9px] bg-line-soft">
                  <div
                    style={{
                      width: entrou ? `${percentual}%` : '0%',
                      background: produto.gradiente,
                      transitionDelay: `${indice * atrasoEntreBarrasEmMs}ms`,
                    }}
                    className="h-full rounded-[9px] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  />
                </div>

                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-[13.5px] font-extrabold text-ink-strong">
                    <NumeroAnimado valor={analisados} />
                  </span>
                  <span className="text-[11.5px] font-semibold text-ink-pale">
                    / {total} clientes
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
