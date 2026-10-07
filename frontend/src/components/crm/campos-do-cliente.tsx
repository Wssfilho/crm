import { Controller, type Control } from 'react-hook-form';
import type { DadosDoClienteForm } from '@/lib/dados-do-cliente';
import {
  mascaraCpf,
  mascaraData,
  mascaraEspecie,
  mascaraMoeda,
  mascaraNb,
  mascaraTelefone,
} from '@/lib/mascaras';
import { cn } from '@/lib/utils';

export function TituloDeSecao({
  numero,
  titulo,
}: {
  numero: string;
  titulo: string;
}) {
  return (
    <div className="flex items-center gap-[9px]">
      <span className="text-[10px] font-extrabold tracking-[.7px] text-brand-600 uppercase">
        {numero} · {titulo}
      </span>
      <span className="h-px flex-1 bg-line-soft" />
    </div>
  );
}

interface CampoProps {
  control: Control<DadosDoClienteForm>;
  name: keyof DadosDoClienteForm;
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
        <label className="flex min-w-0 flex-col gap-1.5">
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
              'h-[42px] w-full min-w-0 rounded-[10px] border bg-panel-subtle px-3 text-[13px] text-ink outline-none focus:bg-white',
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

/** Seções "Identificação" e "Benefício", iguais no cadastro e no painel do card. */
export function CamposDoCliente({
  control,
}: {
  control: Control<DadosDoClienteForm>;
}) {
  return (
    <>
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
    </>
  );
}
