import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useTriagem } from '@/hooks/use-triagem';
import { etapasDoKanban, tempoRelativo } from '@/lib/andamento';
import type { Cliente } from '@/types/triagem';

const LIMITE_DA_OBSERVACAO = 280;

function linkValido(texto: string) {
  try {
    const url = new URL(texto);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

interface EditarClientePainelProps {
  cliente: Cliente;
  onFechar: () => void;
}

export function EditarClientePainel({
  cliente,
  onFechar,
}: EditarClientePainelProps) {
  const { usuarios, usuarioDe, editarCliente, editando } = useTriagem();

  const [driveUrl, setDriveUrl] = useState(cliente.driveUrl ?? '');
  const [observacao, setObservacao] = useState(cliente.observacao ?? '');
  const [responsavelId, setResponsavelId] = useState(
    cliente.responsavelId ?? '',
  );

  const linkDigitado = driveUrl.trim();
  const erroNoLink =
    linkDigitado && !linkValido(linkDigitado)
      ? 'Cole o link completo da pasta, começando com https://'
      : undefined;

  const etapa = etapasDoKanban.find((item) => item.key === cliente.etapa);
  const movidoPor = usuarioDe(cliente.movidoPorId);

  const aoSalvar = (event: FormEvent) => {
    event.preventDefault();

    if (erroNoLink) {
      return;
    }

    editarCliente(
      cliente.id,
      {
        driveUrl: linkDigitado || null,
        observacao: observacao.trim() || null,
        responsavelId: responsavelId || null,
      },
      onFechar,
    );
  };

  return (
    <div
      onClick={onFechar}
      className="fixed inset-0 z-50 flex justify-end bg-[rgba(14,33,55,.35)]"
    >
      <form
        onSubmit={aoSalvar}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-12px_0_32px_rgba(14,33,55,.18)]"
      >
        <div className="flex items-start gap-3 border-b border-line-soft px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="text-[17px] leading-[1.25] font-extrabold text-ink-strong">
              {cliente.name}
            </div>
            <div className="mt-1 text-[12px] text-ink-dim">
              CPF {cliente.cpf} · NB {cliente.nb}
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[11.5px] font-bold text-ink-muted">
              <span
                style={{ background: etapa?.color }}
                className="size-2 rounded-full"
              />
              {etapa?.label}
              {cliente.movidoEm && (
                <span className="font-medium text-ink-dim">
                  · movido por {movidoPor?.name ?? 'alguém'}{' '}
                  {tempoRelativo(cliente.movidoEm)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-ink-dim transition-colors hover:bg-panel-muted hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <FormField
            label="Pasta no Google Drive"
            htmlFor="driveUrl"
            error={erroNoLink}
          >
            <Input
              id="driveUrl"
              value={driveUrl}
              onChange={(event) => setDriveUrl(event.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </FormField>

          <FormField label="Responsável" htmlFor="responsavelId">
            <select
              id="responsavelId"
              value={responsavelId}
              onChange={(event) => setResponsavelId(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Sem responsável</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Observação" htmlFor="observacao">
            <textarea
              id="observacao"
              value={observacao}
              maxLength={LIMITE_DA_OBSERVACAO}
              onChange={(event) => setObservacao(event.target.value)}
              rows={4}
              placeholder="Ex.: falta RG, protocolado no TJBA..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <div className="text-right text-[11px] text-ink-dim">
              {observacao.length}/{LIMITE_DA_OBSERVACAO}
            </div>
          </FormField>
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <Button type="button" variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={editando || Boolean(erroNoLink)}>
            {editando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
