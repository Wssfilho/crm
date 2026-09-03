import { useTriagem } from '@/hooks/use-triagem';
import {
  colunasDoKanban,
  estilosDeStatus,
  GRADIENTE_SEM_PRODUTO,
  PRODUTO_NAO_DEFINIDO,
} from '@/lib/triagem';
import { cn } from '@/lib/utils';

export function Kanban() {
  const { clientes, produtoDe, selecionar } = useTriagem();

  const colunas = colunasDoKanban.map((coluna) => ({
    ...coluna,
    cards: clientes.filter((cliente) => cliente.coluna === coluna.key),
  }));

  const documentos = colunas.find((coluna) => coluna.key === 'DOCS');
  const pendencias = documentos?.cards.length ?? 0;

  const aviso =
    pendencias > 1
      ? `${pendencias} clientes com documentação incompleta`
      : 'Documentação em dia';

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="max-w-[520px] text-[13px] leading-[1.5] text-ink-body">
          Fila operacional do cadastro até a triagem concluída. Clique em um
          card para abrir a análise do cliente.
        </div>

        <span className="ml-auto rounded-[20px] border border-warn-line bg-amber-100 px-3 py-1.5 text-[11.5px] font-bold text-amber-700">
          {aviso}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(5,minmax(200px,1fr))] items-start gap-[13px]">
        {colunas.map((coluna) => (
          <div
            key={coluna.key}
            className="flex min-h-[210px] flex-col gap-[9px] rounded-[14px] border border-board-line bg-board p-[11px]"
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

              return (
                <div
                  key={cliente.id}
                  onClick={() => selecionar(cliente.id)}
                  className="flex cursor-pointer flex-col gap-2 rounded-[11px] border border-line bg-white p-3 shadow-[0_1px_2px_rgba(30,50,80,.05)]"
                >
                  <div
                    style={{
                      background: produto?.gradiente ?? GRADIENTE_SEM_PRODUTO,
                    }}
                    className="h-[3px] w-8 rounded-[3px]"
                  />

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
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
