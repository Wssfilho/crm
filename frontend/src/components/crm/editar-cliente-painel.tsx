import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import {
  CamposDoCliente,
  TituloDeSecao,
} from '@/components/crm/campos-do-cliente';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTriagem } from '@/hooks/use-triagem';
import { etapasDoKanban, tempoRelativo } from '@/lib/andamento';
import {
  dadosDoClienteFormSchema,
  paraDadosDoCliente,
  paraFormulario,
  type DadosDoClienteForm,
} from '@/lib/dados-do-cliente';
import { cn } from '@/lib/utils';
import type { Cliente } from '@/types/triagem';

const LIMITE_DA_OBSERVACAO = 280;

const classeDoCampo =
  'h-[42px] w-full rounded-[10px] border border-line-strong bg-panel-subtle px-3 text-[13px] text-ink outline-none focus:border-brand-600 focus:bg-white';

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
  const { mostrarToast } = useToast();

  const { control, handleSubmit } = useForm<DadosDoClienteForm>({
    resolver: zodResolver(dadosDoClienteFormSchema),
    defaultValues: paraFormulario(cliente),
    mode: 'onChange',
  });

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

  const salvar = handleSubmit(
    (dados) => {
      if (erroNoLink) {
        return;
      }

      editarCliente(
        cliente.id,
        {
          ...paraDadosDoCliente(dados),
          driveUrl: linkDigitado || null,
          observacao: observacao.trim() || null,
          responsavelId: responsavelId || null,
        },
        onFechar,
      );
    },
    () => mostrarToast('Confira os campos destacados antes de salvar.'),
  );

  return (
    <div
      onClick={onFechar}
      className="fixed inset-0 z-50 flex justify-end bg-[rgba(14,33,55,.35)]"
    >
      <form
        onSubmit={salvar}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[600px] flex-col bg-white shadow-[-12px_0_32px_rgba(14,33,55,.18)]"
      >
        <div className="flex items-start gap-3 border-b border-line-soft px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="text-[17px] leading-[1.25] font-extrabold text-ink-strong">
              {cliente.name}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11.5px] font-bold text-ink-muted">
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

        <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto px-6 py-5">
          <CamposDoCliente control={control} />

          <div className="flex flex-col gap-3">
            <TituloDeSecao numero="03" titulo="Andamento" />

            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-ink-soft">
                Pasta no Google Drive
              </span>
              <input
                value={driveUrl}
                onChange={(event) => setDriveUrl(event.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                aria-invalid={Boolean(erroNoLink)}
                className={cn(
                  classeDoCampo,
                  erroNoLink && 'border-red-400 focus:border-red-500',
                )}
              />
              {erroNoLink && (
                <span className="text-[11px] font-semibold text-red-600">
                  {erroNoLink}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-ink-soft">
                Responsável
              </span>
              <select
                value={responsavelId}
                onChange={(event) => setResponsavelId(event.target.value)}
                className={classeDoCampo}
              >
                <option value="">Sem responsável</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-ink-soft">
                Observação
              </span>
              <textarea
                value={observacao}
                maxLength={LIMITE_DA_OBSERVACAO}
                onChange={(event) => setObservacao(event.target.value)}
                rows={3}
                placeholder="Ex.: falta RG, protocolado no TJBA..."
                className="w-full resize-none rounded-[10px] border border-line-strong bg-panel-subtle px-3 py-2 text-[13px] text-ink outline-none placeholder:text-ink-ghost focus:border-brand-600 focus:bg-white"
              />
              <span className="text-right text-[11px] text-ink-dim">
                {observacao.length}/{LIMITE_DA_OBSERVACAO}
              </span>
            </label>
          </div>
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
