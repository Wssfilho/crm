import { z } from 'zod';
import { cpfEhValido, nbEhValido } from '@/core/validation/cpf';

const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 120;
const ANO_EM_MS = 1000 * 60 * 60 * 24 * 365.25;

/** Regras do cadastro do cliente, compartilhadas por criar e editar. */
export const dadosDoClienteSchema = {
  name: z
    .string()
    .trim()
    .min(3)
    .refine((valor) => valor.split(/\s+/).filter(Boolean).length >= 2),
  cpf: z.string().refine(cpfEhValido),
  nascimento: z.iso.date().refine((valor) => {
    const idade = (Date.now() - new Date(valor).getTime()) / ANO_EM_MS;

    return idade >= IDADE_MINIMA && idade <= IDADE_MAXIMA;
  }),
  telefone: z
    .string()
    .refine((valor) => [10, 11].includes(valor.replace(/\D/g, '').length)),
  municipio: z.string().trim().min(2),
  nb: z.string().refine(nbEhValido),
  especie: z.string().trim().min(1),
  rendaEmCentavos: z.number().int().positive(),
};
