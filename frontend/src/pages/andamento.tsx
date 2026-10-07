import { useRef, useState, type DragEvent } from 'react';
import { AndamentoCard } from '@/components/crm/andamento-card';
import { EditarClientePainel } from '@/components/crm/editar-cliente-painel';
import { useTriagem } from '@/hooks/use-triagem';
import { etapasDoKanban } from '@/lib/andamento';
import { cn } from '@/lib/utils';
import type { EtapaCliente } from '@/types/triagem';

export function Andamento() {
  const { clientes, clientesFiltrados, moverEtapa, busca } = useTriagem();

  const [arrastadoId, setArrastadoId] = useState<string | null>(null);
  const [etapaSobDrag, setEtapaSobDrag] = useState<EtapaCliente | null>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const arrastandoRef = useRef(false);

  const colunas = etapasDoKanban.map((etapa) => ({
    ...etapa,
    cards: clientesFiltrados.filter((cliente) => cliente.etapa === etapa.key),
  }));

  const clienteAberto = clientes.find((cliente) => cliente.id === abertoId);

  const encerrarDrag = () => {
    setArrastadoId(null);
    setEtapaSobDrag(null);
    setTimeout(() => {
      arrastandoRef.current = false;
    }, 150);
  };

  const aoIniciarDrag = (
    event: DragEvent<HTMLDivElement>,
    clienteId: string,
  ) => {
    arrastandoRef.current = true;
    setArrastadoId(clienteId);
    event.dataTransfer.setData('text/plain', clienteId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const aoPassarPorCima = (
    event: DragEvent<HTMLDivElement>,
    etapa: EtapaCliente,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    if (etapaSobDrag !== etapa) {
      setEtapaSobDrag(etapa);
    }
  };

  const aoSairDeCima = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setEtapaSobDrag(null);
  };

  const aoSoltar = (event: DragEvent<HTMLDivElement>, etapa: EtapaCliente) => {
    event.preventDefault();

    const clienteId = event.dataTransfer.getData('text/plain') || arrastadoId;
    const cliente = clientes.find((item) => item.id === clienteId);

    if (cliente && cliente.etapa !== etapa) {
      moverEtapa(cliente.id, etapa);
    }

    encerrarDrag();
  };

  const aoAbrir = (clienteId: string) => {
    if (arrastandoRef.current) {
      return;
    }

    setAbertoId(clienteId);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="max-w-[620px] text-[13px] leading-[1.5] text-ink-body">
          Andamento de cada cliente no escritório. Arraste o card para a próxima
          etapa ou clique nele para editar o link do Drive, o responsável e a
          observação.
        </div>

        {busca && (
          <span className="rounded-[20px] border border-brand-100 bg-brand-50 px-3 py-1.5 text-[11.5px] font-bold text-brand-700">
            Filtrando por: “{busca}” ({clientesFiltrados.length}{' '}
            {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'})
          </span>
        )}
      </div>

      <div className="grid grid-cols-[repeat(3,minmax(220px,1fr))] items-start gap-4">
        {colunas.map((coluna) => (
          <div
            key={coluna.key}
            onDragOver={(event) => aoPassarPorCima(event, coluna.key)}
            onDragLeave={aoSairDeCima}
            onDrop={(event) => aoSoltar(event, coluna.key)}
            className={cn(
              'flex min-h-[420px] flex-col gap-[9px] rounded-[14px] border p-3 transition-colors duration-150',
              etapaSobDrag === coluna.key
                ? 'border-dashed border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                : 'border-board-line bg-board',
            )}
          >
            <div className="px-1 pb-1">
              <div className="flex items-center gap-2">
                <span
                  style={{ background: coluna.color }}
                  className="size-2 shrink-0 rounded-full"
                />
                <span className="text-[12px] font-extrabold tracking-[.3px] text-ink-muted uppercase">
                  {coluna.label}
                </span>
                <span className="ml-auto rounded-[20px] border border-board-line bg-white px-2 py-px text-[11px] font-extrabold text-ink-soft">
                  {coluna.cards.length}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-ink-dim">
                {coluna.descricao}
              </div>
            </div>

            {coluna.cards.length === 0 && (
              <div className="rounded-[11px] border border-dashed border-board-line px-3 py-6 text-center text-[11.5px] text-ink-dim">
                Nenhum cliente nesta etapa.
              </div>
            )}

            {coluna.cards.map((cliente) => (
              <AndamentoCard
                key={cliente.id}
                cliente={cliente}
                arrastando={arrastadoId === cliente.id}
                onDragStart={(event) => aoIniciarDrag(event, cliente.id)}
                onDragEnd={encerrarDrag}
                onAbrir={() => aoAbrir(cliente.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {clienteAberto && (
        <EditarClientePainel
          key={clienteAberto.id}
          cliente={clienteAberto}
          onFechar={() => setAbertoId(null)}
        />
      )}
    </div>
  );
}
