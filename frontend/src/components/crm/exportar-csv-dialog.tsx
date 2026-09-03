import { useTriagem } from '@/hooks/use-triagem';
import { colunasDoCsv, gerarPreviaDoCsv } from '@/lib/csv';
import { rotulosDeFiltro } from '@/lib/triagem';

export function ExportarCsvDialog() {
  const {
    csvAberto,
    fecharCsv,
    confirmarCsv,
    clientesFiltrados,
    filtro,
    produtoDe,
  } = useTriagem();

  if (!csvAberto) {
    return null;
  }

  const subtitulo =
    filtro === 'todos'
      ? 'Todos os clientes da carteira'
      : `Filtro ativo: ${rotulosDeFiltro[filtro]}`;

  return (
    <div
      onClick={fecharCsv}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(14,33,55,.55)] p-8"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-[min(560px,100%)] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)]"
      >
        <div className="flex items-center gap-[13px] border-b border-line-soft px-[22px] py-[18px]">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-success-line bg-success-surface text-[10px] font-extrabold text-green-700">
            CSV
          </div>

          <div>
            <div className="text-[15px] font-extrabold text-ink-strong">
              Exportar carteira
            </div>
            <div className="mt-0.5 text-xs text-ink-faint">{subtitulo}</div>
          </div>

          <button
            type="button"
            onClick={fecharCsv}
            className="ml-auto size-8 cursor-pointer rounded-[9px] border border-line-strong bg-white text-[15px] text-ink-pale"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2.5 px-[22px] py-[18px]">
          <div className="text-[10px] font-extrabold tracking-[.6px] text-ink-pale uppercase">
            Colunas incluídas
          </div>

          <div className="flex flex-wrap gap-[7px]">
            {colunasDoCsv.map((coluna) => (
              <span
                key={coluna}
                className="rounded-[7px] border border-brand-200 bg-brand-50 px-[9px] py-1 font-mono text-[11px] font-semibold text-brand-600"
              >
                {coluna}
              </span>
            ))}
          </div>

          <pre className="mt-1.5 overflow-x-auto rounded-[11px] border border-line-card bg-panel-subtle px-[13px] py-3 font-mono text-[10.5px] leading-[1.9] text-ink-soft">
            {gerarPreviaDoCsv(clientesFiltrados, produtoDe)}
          </pre>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line-soft px-[22px] py-4">
          <button
            type="button"
            onClick={fecharCsv}
            className="cursor-pointer rounded-[11px] border border-line-strong bg-white px-4 py-[11px] text-[13px] font-bold text-ink-soft"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmarCsv}
            className="cursor-pointer rounded-[11px] bg-[linear-gradient(135deg,#16a34a,#15803d)] px-[18px] py-[11px] text-[13px] font-extrabold text-white"
          >
            Baixar {clientesFiltrados.length} linhas
          </button>
        </div>
      </div>
    </div>
  );
}
