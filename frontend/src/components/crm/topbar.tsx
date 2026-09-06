import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useTriagem } from '@/hooks/use-triagem';
import { tituloDaRota } from '@/lib/navegacao';

export function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { busca, definirBusca, abrirCsv, abrirNovo } = useTriagem();

  const titulo = tituloDaRota(pathname);

  const aoMudarBusca = (valor: string) => {
    definirBusca(valor);
    if (valor.trim() && pathname !== '/' && pathname !== '/kanban') {
      navigate('/');
    }
  };

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
        <div className="group flex h-[38px] w-[270px] items-center gap-2 rounded-[10px] border border-line-strong bg-panel-muted px-3 transition-all duration-150 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
          <Search className="size-4 shrink-0 text-ink-ghost transition-colors group-focus-within:text-brand-500" />

          <input
            value={busca}
            onChange={(event) => aoMudarBusca(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                definirBusca('');
              }
            }}
            placeholder="Buscar cliente, CPF ou benefício"
            className="w-full border-none bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-ghost"
          />

          {busca && (
            <button
              type="button"
              onClick={() => definirBusca('')}
              title="Limpar busca (Esc)"
              aria-label="Limpar busca"
              className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-ghost transition-colors hover:bg-line-muted hover:text-ink"
            >
              <X className="size-3" />
            </button>
          )}
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
