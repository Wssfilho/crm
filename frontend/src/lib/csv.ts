import { estilosDeStatus } from './triagem';
import type { Cliente, Produto } from '@/types/triagem';

export const colunasDoCsv = [
  'nome',
  'cpf',
  'beneficio',
  'produto',
  'status',
  'contratos',
  'valor_estimado',
];

const LINHAS_NA_PREVIA = 3;

function linhaDoCliente(cliente: Cliente, produto?: Produto): string {
  return [
    cliente.name,
    cliente.cpf,
    cliente.nb,
    produto?.name ?? '',
    estilosDeStatus[cliente.status].label,
    cliente.contratos,
    cliente.valorEmCentavos / 100,
  ].join(';');
}

export function gerarPreviaDoCsv(
  clientes: Cliente[],
  produtoDe: (cliente: Cliente) => Produto | undefined,
): string {
  const cabecalho = colunasDoCsv.join(';');

  const linhas = clientes
    .slice(0, LINHAS_NA_PREVIA)
    .map((cliente) => linhaDoCliente(cliente, produtoDe(cliente)))
    .join('\n');

  const restantes = clientes.length - LINHAS_NA_PREVIA;
  const rodape = restantes > 0 ? `\n… +${restantes} linhas` : '';

  return `${cabecalho}\n${linhas}${rodape}`;
}
