import type { DragEvent } from 'react';
import { ExternalLink, GripVertical } from 'lucide-react';
import { useTriagem } from '@/hooks/use-triagem';
import { tempoRelativo } from '@/lib/andamento';
import { iniciaisDe } from '@/lib/triagem';
import { cn } from '@/lib/utils';
import type { Cliente } from '@/types/triagem';

interface AndamentoCardProps {
  cliente: Cliente;
  arrastando: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onAbrir: () => void;
}

export function AndamentoCard({
  cliente,
  arrastando,
  onDragStart,
  onDragEnd,
  onAbrir,
}: AndamentoCardProps) {
  const { usuarioDe } = useTriagem();

  const responsavel = usuarioDe(cliente.responsavelId);
  const movidoPor = usuarioDe(cliente.movidoPorId);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onAbrir}
      className={cn(
        'group flex cursor-grab flex-col gap-2 rounded-[11px] border bg-white p-3 shadow-[0_1px_2px_rgba(30,50,80,.05)] transition-all duration-150 active:cursor-grabbing hover:border-line-strong hover:shadow-md',
        arrastando
          ? 'scale-[0.98] border-dashed border-brand-500 opacity-40 ring-2 ring-brand-500/30'
          : 'border-line',
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] leading-[1.3] font-bold text-ink">
            {cliente.name}
          </div>
          <div className="mt-0.5 text-[10.5px] text-ink-dim">
            CPF {cliente.cpf}
          </div>
        </div>

        <GripVertical className="size-3.5 shrink-0 text-ink-ghost opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {cliente.observacao && (
        <div className="line-clamp-2 rounded-md bg-panel-muted px-2 py-1.5 text-[11.5px] leading-[1.4] text-ink-body">
          {cliente.observacao}
        </div>
      )}

      <div className="flex items-center gap-2">
        {responsavel ? (
          <span
            title={`Responsável: ${responsavel.name}`}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted"
          >
            <span className="flex size-[22px] items-center justify-center rounded-full bg-brand-50 text-[9.5px] font-extrabold text-brand-700">
              {iniciaisDe(responsavel.name)}
            </span>
            {responsavel.name.split(' ')[0]}
          </span>
        ) : (
          <span className="text-[11px] text-ink-pale">Sem responsável</span>
        )}

        {cliente.driveUrl && (
          <a
            href={cliente.driveUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="ml-auto flex items-center gap-1 rounded-md border border-line-muted px-2 py-1 text-[10.5px] font-bold text-ink-soft transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            Drive
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      {cliente.movidoEm && (
        <div className="border-t border-line-faint pt-[7px] text-[10.5px] text-ink-dim">
          Movido por {movidoPor?.name.split(' ')[0] ?? 'alguém'} ·{' '}
          {tempoRelativo(cliente.movidoEm)}
        </div>
      )}
    </div>
  );
}
