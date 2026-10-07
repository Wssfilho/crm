import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CamposDoCliente } from '@/components/crm/campos-do-cliente';
import { useToast } from '@/hooks/use-toast';
import { useTriagem } from '@/hooks/use-triagem';
import {
  dadosDoClienteFormSchema,
  formularioVazio,
  paraDadosDoCliente,
  type DadosDoClienteForm,
} from '@/lib/dados-do-cliente';
import { cn } from '@/lib/utils';

export function NovoClienteDialog() {
  const { novoAberto, fecharNovo, criarCliente, salvando } = useTriagem();
  const { mostrarToast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<DadosDoClienteForm>({
    resolver: zodResolver(dadosDoClienteFormSchema),
    defaultValues: formularioVazio,
    mode: 'onChange',
  });

  if (!novoAberto) {
    return null;
  }

  const salvar = handleSubmit(
    (dados) => {
      const cadastro = paraDadosDoCliente(dados);

      criarCliente(
        {
          name: cadastro.name,
          cpf: cadastro.cpf,
          nascimento: cadastro.nascimento ?? undefined,
          telefone: cadastro.telefone ?? undefined,
          municipio: cadastro.municipio ?? undefined,
          nb: cadastro.nb,
          especie: cadastro.especie ?? undefined,
          rendaEmCentavos: cadastro.rendaEmCentavos ?? undefined,
        },
        () => reset(formularioVazio),
      );
    },
    () => mostrarToast('Confira os campos destacados antes de salvar.'),
  );

  return (
    <div
      onClick={fecharNovo}
      className="fixed inset-0 z-55 flex items-start justify-center overflow-y-auto bg-[rgba(14,33,55,.55)] px-8 py-[34px]"
    >
      <form
        onSubmit={salvar}
        onClick={(event) => event.stopPropagation()}
        className="w-[min(760px,100%)] overflow-hidden rounded-[18px] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)]"
      >
        <div className="flex items-center gap-[13px] border-b border-line-soft px-6 py-[18px]">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#4f46e5,#4338ca)] text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,.8)]">
            <Plus className="size-[18px]" strokeWidth={3} />
          </div>

          <div>
            <div className="text-base font-extrabold tracking-[-.2px] text-ink-strong">
              Novo cliente
            </div>
            <div className="mt-0.5 text-xs text-ink-faint">
              Cadastro do cliente · entra na etapa Comercial
            </div>
          </div>

          <button
            type="button"
            onClick={fecharNovo}
            aria-label="Fechar"
            className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-[9px] border border-line-strong bg-white text-ink-pale"
          >
            <X className="size-[15px]" />
          </button>
        </div>

        <div className="flex max-h-[calc(100vh-250px)] flex-col gap-[22px] overflow-y-auto px-6 pt-5 pb-6">
          <CamposDoCliente control={control} />
        </div>

        <div className="flex items-center gap-2.5 border-t border-line-soft bg-panel-subtle px-6 py-4">
          <div
            className={cn(
              'text-[11.5px] font-semibold',
              isValid ? 'text-status-acao' : 'text-ink-pale',
            )}
          >
            {isValid
              ? 'Pronto para salvar'
              : 'Nome, CPF e nº do benefício são obrigatórios'}
          </div>

          <button
            type="submit"
            disabled={salvando}
            className={cn(
              'ml-auto rounded-[11px] px-[18px] py-[11px] text-[13px] font-extrabold disabled:opacity-60',
              isValid
                ? 'cursor-pointer bg-[linear-gradient(135deg,#4f46e5,#4338ca)] text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,.8)]'
                : 'cursor-not-allowed bg-[#dfe4ea] text-[#96a3b2]',
            )}
          >
            {salvando ? 'Salvando...' : 'Salvar cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
