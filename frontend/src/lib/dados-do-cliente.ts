import { z } from 'zod';
import { paraCentavos } from '@/lib/formatos';
import {
  mascaraCpf,
  mascaraMoeda,
  mascaraNb,
  mascaraTelefone,
} from '@/lib/mascaras';
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
import type { Cliente, DadosDoCliente } from '@/types/triagem';

/** Campos do cadastro, compartilhados pelo "Novo cliente" e pelo painel do card. */
export const dadosDoClienteFormSchema = z.object({
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

export type DadosDoClienteForm = z.infer<typeof dadosDoClienteFormSchema>;

export const formularioVazio: DadosDoClienteForm = {
  nome: '',
  cpf: '',
  nascimento: '',
  telefone: '',
  municipio: '',
  nb: '',
  especie: '',
  renda: '',
};

function dataDoFormulario(iso: string) {
  const data = new Date(iso);
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');

  return `${dia}/${mes}/${data.getUTCFullYear()}`;
}

/** Preenche o formulário com o que está salvo, já com as máscaras. */
export function paraFormulario(
  cliente: Pick<
    Cliente,
    | 'name'
    | 'cpf'
    | 'nascimento'
    | 'telefone'
    | 'municipio'
    | 'nb'
    | 'especie'
    | 'rendaEmCentavos'
  >,
): DadosDoClienteForm {
  return {
    nome: cliente.name,
    cpf: mascaraCpf(cliente.cpf),
    nascimento: cliente.nascimento ? dataDoFormulario(cliente.nascimento) : '',
    telefone: cliente.telefone ? mascaraTelefone(cliente.telefone) : '',
    municipio: cliente.municipio ?? '',
    nb: mascaraNb(cliente.nb),
    especie: cliente.especie ?? '',
    renda: cliente.rendaEmCentavos
      ? mascaraMoeda(String(cliente.rendaEmCentavos))
      : '',
  };
}

/** Converte o formulário no corpo da API; campo opcional vazio vira `null`. */
export function paraDadosDoCliente(dados: DadosDoClienteForm): DadosDoCliente {
  return {
    name: dados.nome.trim(),
    cpf: dados.cpf,
    nascimento: analisarData(dados.nascimento)?.iso ?? null,
    telefone: dados.telefone || null,
    municipio: dados.municipio || null,
    nb: dados.nb,
    especie: dados.especie || null,
    rendaEmCentavos: paraCentavos(dados.renda) ?? null,
  };
}
