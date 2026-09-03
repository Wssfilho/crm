import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Plus, X } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useTriagem } from '@/hooks/use-triagem';
import { paraCentavos } from '@/lib/formatos';
import {
  mascaraCpf,
  mascaraData,
  mascaraEspecie,
  mascaraMoeda,
  mascaraNb,
  mascaraTelefone,
} from '@/lib/mascaras';
import { cn } from '@/lib/utils';
import {
  analisarData,
  cpfEhValido,
  especieEhValida,
  IDADE_MAXIMA,
  IDADE_MINIMA,
  municipioEhValido,
  nascimentoEhValido,
  nbEhValido,
  telefoneEhValido,
} from '@/lib/validacoes';

const novoClienteFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'Informe o nome completo')
    .refine(
      (valor) => valor.split(/\s+/).length >= 2,
      'Informe nome e sobrenome, como consta na procuração',
    ),
  cpf: z
    .string()
    .min(1, 'Informe o CPF')
    .refine(cpfEhValido, 'CPF inválido — confira os dígitos'),
  nascimento: z
    .string()
    .refine(
      (valor) => !valor || nascimentoEhValido(valor),
      `Data inválida — use dd/mm/aaaa, entre ${IDADE_MINIMA} e ${IDADE_MAXIMA} anos`,
    ),
  telefone: z
    .string()
    .refine(
      (valor) => !valor || telefoneEhValido(valor),
      'Telefone inválido — DDD + 8 ou 9 dígitos',
    ),
  municipio: z
    .string()
    .refine(
      (valor) => !valor || municipioEhValido(valor),
      'Use Cidade-UF, como em Itabuna-BA',
    ),
  nb: z
    .string()
    .min(1, 'Informe o nº do benefício')
    .refine(nbEhValido, 'O nº do benefício do INSS tem 10 dígitos'),
  especie: z
    .string()
    .refine(
      (valor) => !valor || especieEhValida(valor),
      'Código numérico de até 3 dígitos, como 41',
    ),
  renda: z
    .string()
    .refine(
      (valor) => !valor || (paraCentavos(valor) ?? 0) > 0,
      'Informe um valor maior que zero',
    ),
});

type NovoClienteFormSchema = z.infer<typeof novoClienteFormSchema>;

const formularioVazio: NovoClienteFormSchema = {
  nome: '',
  cpf: '',
  nascimento: '',
  telefone: '',
  municipio: '',
  nb: '',
  especie: '',
  renda: '',
};

type ChaveDeDocumento =
  'procuracao' | 'extratoBeneficio' | 'extratoEmprestimos';

const documentos: { chave: ChaveDeDocumento; label: string }[] = [
  { chave: 'procuracao', label: 'Procuração' },
  { chave: 'extratoBeneficio', label: 'Extrato do benefício' },
  { chave: 'extratoEmprestimos', label: 'Extrato de empréstimos' },
];

function TituloDeSecao({
  numero,
  titulo,
  contador,
}: {
  numero: string;
  titulo: string;
  contador?: string;
}) {
  return (
    <div className="flex items-center gap-[9px]">
      <span className="text-[10px] font-extrabold tracking-[.7px] text-brand-600 uppercase">
        {numero} · {titulo}
      </span>
      <span className="h-px flex-1 bg-line-soft" />
      {contador && (
        <span className="text-[11px] font-bold text-ink-faint">{contador}</span>
      )}
    </div>
  );
}

interface CampoProps {
  control: Control<NovoClienteFormSchema>;
  name: keyof NovoClienteFormSchema;
  label: string;
  placeholder: string;
  mascara?: (texto: string) => string;
  numerico?: boolean;
}

function Campo({
  control,
  name,
  label,
  placeholder,
  mascara,
  numerico,
}: CampoProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-bold text-ink-soft">{label}</span>

          <input
            value={field.value}
            onChange={(event) =>
              field.onChange(
                mascara ? mascara(event.target.value) : event.target.value,
              )
            }
            onBlur={field.onBlur}
            placeholder={placeholder}
            aria-invalid={Boolean(fieldState.error)}
            className={cn(
              'h-[42px] rounded-[10px] border bg-panel-subtle px-3 text-[13px] text-ink outline-none focus:bg-white',
              numerico && 'tabular-nums',
              fieldState.error
                ? 'border-red-400 focus:border-red-500'
                : 'border-line-strong focus:border-brand-600',
            )}
          />

          {fieldState.error && (
            <span className="text-[11px] font-semibold text-red-600">
              {fieldState.error.message}
            </span>
          )}
        </label>
      )}
    />
  );
}

export function NovoClienteDialog() {
  const { novoAberto, fecharNovo, criarCliente, salvando } = useTriagem();
  const { mostrarToast } = useToast();

  const [anexados, setAnexados] = useState<Record<ChaveDeDocumento, boolean>>({
    procuracao: false,
    extratoBeneficio: false,
    extratoEmprestimos: false,
  });

  const seletorDeArquivo = useRef<HTMLInputElement>(null);
  const documentoEmFoco = useRef<ChaveDeDocumento | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<NovoClienteFormSchema>({
    resolver: zodResolver(novoClienteFormSchema),
    defaultValues: formularioVazio,
    mode: 'onChange',
  });

  if (!novoAberto) {
    return null;
  }

  const anexadosCount = Object.values(anexados).filter(Boolean).length;

  function limpar() {
    reset(formularioVazio);
    setAnexados({
      procuracao: false,
      extratoBeneficio: false,
      extratoEmprestimos: false,
    });
  }

  function abrirSeletor(chave: ChaveDeDocumento) {
    if (anexados[chave]) {
      setAnexados((atual) => ({ ...atual, [chave]: false }));
      return;
    }

    documentoEmFoco.current = chave;
    seletorDeArquivo.current?.click();
  }

  function aoEscolherArquivo(event: ChangeEvent<HTMLInputElement>) {
    const chave = documentoEmFoco.current;

    if (chave && event.target.files?.length) {
      setAnexados((atual) => ({ ...atual, [chave]: true }));
    }

    event.target.value = '';
    documentoEmFoco.current = null;
  }

  const submeter = (enviarParaAnalise: boolean) =>
    handleSubmit(
      (dados) =>
        criarCliente(
          {
            name: dados.nome.trim(),
            cpf: dados.cpf,
            nascimento: analisarData(dados.nascimento)?.iso,
            telefone: dados.telefone || undefined,
            municipio: dados.municipio || undefined,
            nb: dados.nb,
            especie: dados.especie || undefined,
            rendaEmCentavos: paraCentavos(dados.renda),
            ...anexados,
            enviarParaAnalise,
          },
          limpar,
        ),
      () => mostrarToast('Confira os campos destacados antes de enviar.'),
    );

  return (
    <div
      onClick={fecharNovo}
      className="fixed inset-0 z-55 flex items-start justify-center overflow-y-auto bg-[rgba(14,33,55,.55)] px-8 py-[34px]"
    >
      <input
        ref={seletorDeArquivo}
        type="file"
        accept="application/pdf"
        onChange={aoEscolherArquivo}
        className="hidden"
      />

      <div
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
              Cadastro mínimo para envio à triagem automatizada
            </div>
          </div>

          <button
            type="button"
            onClick={fecharNovo}
            className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-[9px] border border-line-strong bg-white text-ink-pale"
          >
            <X className="size-[15px]" />
          </button>
        </div>

        <div className="flex max-h-[calc(100vh-250px)] flex-col gap-[22px] overflow-y-auto px-6 pt-5 pb-6">
          <div className="flex flex-col gap-3">
            <TituloDeSecao numero="01" titulo="Identificação" />

            <div className="grid grid-cols-[1.6fr_1fr] items-start gap-3">
              <Campo
                control={control}
                name="nome"
                label="Nome completo"
                placeholder="Como consta na procuração"
              />
              <Campo
                control={control}
                name="cpf"
                label="CPF"
                placeholder="000.000.000-00"
                mascara={mascaraCpf}
                numerico
              />
            </div>

            <div className="grid grid-cols-[1fr_1fr_1.4fr] items-start gap-3">
              <Campo
                control={control}
                name="nascimento"
                label="Nascimento"
                placeholder="dd/mm/aaaa"
                mascara={mascaraData}
                numerico
              />
              <Campo
                control={control}
                name="telefone"
                label="Telefone"
                placeholder="(73) 90000-0000"
                mascara={mascaraTelefone}
                numerico
              />
              <Campo
                control={control}
                name="municipio"
                label="Município / UF"
                placeholder="Itabuna-BA"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <TituloDeSecao numero="02" titulo="Benefício" />

            <div className="grid grid-cols-[1.2fr_1fr_1fr] items-start gap-3">
              <Campo
                control={control}
                name="nb"
                label="Nº do benefício"
                placeholder="000.000.000-0"
                mascara={mascaraNb}
                numerico
              />
              <Campo
                control={control}
                name="especie"
                label="Espécie"
                placeholder="41"
                mascara={mascaraEspecie}
                numerico
              />
              <Campo
                control={control}
                name="renda"
                label="Renda mensal"
                placeholder="R$ 1.518,00"
                mascara={mascaraMoeda}
                numerico
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <TituloDeSecao
              numero="03"
              titulo="Documentos"
              contador={`${anexadosCount} de 3 anexados`}
            />

            <div className="grid grid-cols-3 gap-2.5">
              {documentos.map((documento) => {
                const anexado = anexados[documento.chave];

                return (
                  <div
                    key={documento.chave}
                    onClick={() => abrirSeletor(documento.chave)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] p-3',
                      anexado
                        ? 'border-solid border-success-line bg-[#f8fefb]'
                        : 'border-dashed border-[#d5dde7] bg-white',
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-[26px] shrink-0 items-center justify-center rounded-lg',
                        anexado
                          ? 'bg-success-surface text-green-700'
                          : 'bg-line-faint text-ink-pale',
                      )}
                    >
                      {anexado ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : (
                        <Plus className="size-3" strokeWidth={3} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs leading-[1.3] font-bold text-ink">
                        {documento.label}
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-ink-dim">
                        {anexado ? 'Anexado · PDF' : 'Clique para anexar'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-[11px] rounded-xl border border-brand-200 bg-[#f6f7fe] px-[15px] py-[13px]">
            <span className="mt-1 size-[9px] shrink-0 rounded-full bg-brand-600" />
            <div className="text-[11.5px] leading-[1.6] text-[#4a5a72]">
              Ao enviar, o cliente entra na coluna{' '}
              <strong className="text-ink-strong">Análise n8n</strong> e os
              extratos são processados para identificar contratos irregulares. O
              resultado volta ao CRM em poucos minutos.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-t border-line-soft bg-panel-subtle px-6 py-4">
          <div
            className={cn(
              'text-[11.5px] font-semibold',
              isValid ? 'text-status-acao' : 'text-ink-pale',
            )}
          >
            {isValid
              ? 'Pronto para enviar'
              : 'Nome, CPF e nº do benefício são obrigatórios'}
          </div>

          <div className="ml-auto flex gap-2.5">
            <button
              type="button"
              onClick={submeter(false)}
              disabled={salvando}
              className="cursor-pointer rounded-[11px] border border-line-strong bg-white px-4 py-[11px] text-[13px] font-bold text-ink-soft disabled:opacity-60"
            >
              Salvar rascunho
            </button>

            <button
              type="button"
              onClick={submeter(true)}
              disabled={salvando}
              className={cn(
                'rounded-[11px] px-[18px] py-[11px] text-[13px] font-extrabold',
                isValid
                  ? 'cursor-pointer bg-[linear-gradient(135deg,#4f46e5,#4338ca)] text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,.8)]'
                  : 'cursor-not-allowed bg-[#dfe4ea] text-[#96a3b2]',
              )}
            >
              Salvar e enviar à análise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
