import { useLocation } from 'react-router-dom';
import { useTriagem } from '@/hooks/use-triagem';
import { tituloDaRota } from '@/lib/navegacao';

export function Topbar() {
  const { pathname } = useLocation();
  const { busca, definirBusca, abrirCsv, abrirNovo } = useTriagem();

  const titulo = tituloDaRota(pathname);

  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-line-strong bg-white px-[30px] py-[15px]">
      <div>
        <div className="text-[11.5px] font-semibold tracking-[.2px] text-ink-dim">
          CRM / {titulo}
        </div>
        <div className="mt-px text-[19px] font-extrabold tracking-[-.3px] text-ink-strong">
          {titulo}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="flex h-[38px] w-[250px] items-center gap-2 rounded-[10px] border border-line-strong bg-panel-muted px-3">
          <div className="size-[13px] shrink-0 rounded-full border-[1.8px] border-ink-ghost" />

          <input
            value={busca}
            onChange={(event) => definirBusca(event.target.value)}
            placeholder="Buscar cliente, CPF ou benefício"
            className="w-full border-none bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-ghost"
          />
        </div>

        <button
          type="button"
          onClick={abrirCsv}
          className="flex h-[38px] cursor-pointer items-center gap-2 rounded-[10px] border border-success-line bg-success-surface px-[15px] text-[12.5px] font-bold text-green-700"
        >
          <span className="size-[13px] shrink-0 rounded-[3px] border-[1.8px] border-green-600" />
          Exportar CSV
        </button>

        <button
          type="button"
          onClick={abrirNovo}
          className="flex h-[38px] cursor-pointer items-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#4f46e5,#4338ca)] px-4 text-[12.5px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,.8)]"
        >
          + Novo cliente
        </button>
      </div>
    </header>
  );
}
