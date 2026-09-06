import { useRef, useState, type DragEvent } from 'react';
import { GripVertical } from 'lucide-react';
import { useTriagem } from '@/hooks/use-triagem';
import {
  colunasDoKanban,
  estilosDeStatus,
  GRADIENTE_SEM_PRODUTO,
  PRODUTO_NAO_DEFINIDO,
} from '@/lib/triagem';
import { cn } from '@/lib/utils';
import type { ColunaKanban } from '@/types/triagem';

export function Kanban() {
  const {
    clientes,
    clientesFiltrados,
    produtoDe,
    selecionar,
    moverColuna,
    busca,
  } = useTriagem();

  const [draggedClienteId, setDraggedClienteId] = useState<string | null>(null);
  const [dragOverColuna, setDragOverColuna] = useState<ColunaKanban | null>(
    null,
  );
  const isDraggingRef = useRef(false);

  const colunas = colunasDoKanban.map((coluna) => ({
    ...coluna,
    cards: clientesFiltrados.filter((cliente) => cliente.coluna === coluna.key),
  }));

  const documentos = colunas.find((coluna) => coluna.key === 'DOCS');
  const pendencias = documentos?.cards.length ?? 0;

  const aviso =
    pendencias > 1
      ? `${pendencias} clientes com documentação incompleta`
      : 'Documentação em dia';

  const handleDragStart = (e: DragEvent<HTMLDivElement>, clienteId: string) => {
    isDraggingRef.current = true;
    setDraggedClienteId(clienteId);
    e.dataTransfer.setData('text/plain', clienteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedClienteId(null);
    setDragOverColuna(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleDragOver = (
    e: DragEvent<HTMLDivElement>,
    colunaKey: ColunaKanban,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColuna !== colunaKey) {
      setDragOverColuna(colunaKey);
    }
  };

  const handleDragLeave = (
    e: DragEvent<HTMLDivElement>,
    colunaKey: ColunaKanban,
  ) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    if (dragOverColuna === colunaKey) {
      setDragOverColuna(null);
    }
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    targetColuna: ColunaKanban,
  ) => {
    e.preventDefault();
    const clienteId = e.dataTransfer.getData('text/plain') || draggedClienteId;

    if (clienteId) {
      const cliente = clientes.find((c) => c.id === clienteId);
      if (cliente && cliente.coluna !== targetColuna) {
        moverColuna(clienteId, targetColuna);
      }
    }

    setDraggedClienteId(null);
    setDragOverColuna(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleCardClick = (clienteId: string) => {
    if (isDraggingRef.current) {
      return;
    }
    selecionar(clienteId);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="max-w-[560px] text-[13px] leading-[1.5] text-ink-body">
          Fila operacional da triagem. Arraste os cards entre as colunas para
          mudar de estágio ou clique para abrir a análise detalhada.
        </div>

        {busca && (
          <span className="rounded-[20px] border border-brand-100 bg-brand-50 px-3 py-1.5 text-[11.5px] font-bold text-brand-700">
            Filtrando por: “{busca}” ({clientesFiltrados.length}{' '}
            {clientesFiltrados.length === 1 ? 'card' : 'cards'})
          </span>
        )}

        <span className="ml-auto rounded-[20px] border border-warn-line bg-amber-100 px-3 py-1.5 text-[11.5px] font-bold text-amber-700">
          {aviso}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(5,minmax(200px,1fr))] items-start gap-[13px]">
        {colunas.map((coluna) => {
          const isOver = dragOverColuna === coluna.key;

          return (
            <div
              key={coluna.key}
              onDragOver={(e) => handleDragOver(e, coluna.key)}
              onDragLeave={(e) => handleDragLeave(e, coluna.key)}
              onDrop={(e) => handleDrop(e, coluna.key)}
              className={cn(
                'flex min-h-[300px] flex-col gap-[9px] rounded-[14px] border p-[11px] transition-colors duration-150',
                isOver
                  ? 'border-dashed border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                  : 'border-board-line bg-board',
              )}
            >
              <div className="flex items-center gap-2 px-1 py-0.5">
                <span
                  style={{ background: coluna.color }}
                  className="size-2 shrink-0 rounded-full"
                />
                <span className="text-[11px] font-extrabold tracking-[.3px] text-ink-muted uppercase">
                  {coluna.label}
                </span>
                <span className="ml-auto rounded-[20px] border border-board-line bg-white px-2 py-px text-[11px] font-extrabold text-ink-soft">
                  {coluna.cards.length}
                </span>
              </div>

              {coluna.cards.map((cliente) => {
                const estilo = estilosDeStatus[cliente.status];
                const produto = produtoDe(cliente);
                const isBeingDragged = draggedClienteId === cliente.id;

                return (
                  <div
                    key={cliente.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cliente.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleCardClick(cliente.id)}
                    className={cn(
                      'group flex cursor-grab flex-col gap-2 rounded-[11px] border bg-white p-3 shadow-[0_1px_2px_rgba(30,50,80,.05)] transition-all duration-150 active:cursor-grabbing hover:border-line-strong hover:shadow-md',
                      isBeingDragged
                        ? 'scale-[0.98] border-dashed border-brand-500 opacity-40 ring-2 ring-brand-500/30'
                        : 'border-line',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        style={{
                          background:
                            produto?.gradiente ?? GRADIENTE_SEM_PRODUTO,
                        }}
                        className="h-[3px] w-8 rounded-[3px]"
                      />

                      <GripVertical className="size-3.5 text-ink-ghost opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <div className="text-[12.5px] leading-[1.3] font-bold text-ink">
                      {cliente.name}
                    </div>

                    <div className="text-[10px] font-bold tracking-[.3px] text-ink-faint uppercase">
                      {produto?.name ?? PRODUTO_NAO_DEFINIDO}
                    </div>

                    <div className="flex items-center gap-[7px] border-t border-line-faint pt-[7px]">
                      <span className="rounded-md bg-line-faint px-[7px] py-[3px] text-[10.5px] font-bold text-ink-faint">
                        {cliente.docs}/3 docs
                      </span>

                      <span
                        className={cn(
                          'ml-auto text-[10.5px] font-extrabold',
                          estilo.text,
                        )}
                      >
                        {estilo.label}
                      </span>
                    </div>

                    {/* Ação rápida de mover coluna (acessibilidade / clique direto) */}
                    <div
                      className="mt-1 flex items-center justify-between border-t border-line-faint pt-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-medium text-ink-ghost">
                        Mover:
                      </span>
                      <select
                        value={cliente.coluna}
                        onChange={(e) => {
                          e.stopPropagation();
                          moverColuna(
                            cliente.id,
                            e.target.value as ColunaKanban,
                          );
                        }}
                        aria-label={`Mover ${cliente.name} para outra coluna`}
                        className="cursor-pointer rounded border border-line-card bg-panel-muted px-1.5 py-0.5 text-[10px] font-bold text-ink-muted transition-colors hover:border-brand-500 hover:text-brand-600 focus:outline-none"
                      >
                        {colunasDoKanban.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}

              {coluna.cards.length === 0 && (
                <div
                  className={cn(
                    'flex flex-1 items-center justify-center rounded-[10px] border border-dashed py-8 text-center text-[11px] font-medium transition-colors',
                    isOver
                      ? 'border-brand-500/50 bg-brand-50/40 text-brand-700 font-bold'
                      : 'border-board-line/80 text-ink-ghost',
                  )}
                >
                  {isOver
                    ? 'Solte o card aqui'
                    : busca
                      ? 'Nenhum card correspondente'
                      : 'Nenhum cliente nesta etapa'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
