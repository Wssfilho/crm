import { describe, expect, it } from 'vitest';
import type { Cliente, Produto } from '@/types/triagem';
import {
  apenasDigitos,
  atendeABusca,
  atendeAoFiltro,
  normalizarParaBusca,
} from './triagem';

const mockProdutos: Produto[] = [
  {
    id: 'prod-1',
    slug: 'excluidos',
    name: 'Excluídos do INSS',
    mono: 'EX',
    gradiente: 'linear-gradient(135deg,#0891b2,#0284c7)',
  },
  {
    id: 'prod-2',
    slug: 'rmc',
    name: 'Cartão de Crédito RMC',
    mono: 'RMC',
    gradiente: 'linear-gradient(135deg,#16a34a,#15803d)',
  },
];

const mockCliente: Cliente = {
  id: 'cli-1',
  name: 'José Raimundo dos Santos',
  cpf: '042.318.765-17',
  nascimento: '1952-05-14',
  idade: 72,
  telefone: '(41) 99123-4567',
  municipio: 'Curitiba',
  nb: '128.456.789-0',
  especie: 'Aposentadoria por Idade',
  rendaEmCentavos: 250000,
  produtoId: 'prod-1',
  status: 'ACAO',
  coluna: 'TRIADO',
  docs: 3,
  contratos: 2,
  valorEmCentavos: 1296000,
  procuracao: true,
  extratoBeneficio: true,
  extratoEmprestimos: true,
  acoes: [
    {
      id: 'ac-1',
      name: 'Ação declaratória de inexistência de débito c/c repetição em dobro',
      base: 'CDC art. 42 · Súmula 479 STJ',
    },
  ],
};

describe('normalizarParaBusca', () => {
  it('should remove accents and lowercase text', () => {
    expect(normalizarParaBusca('José')).toBe('jose');
    expect(normalizarParaBusca('São Paulo')).toBe('sao paulo');
    expect(normalizarParaBusca('Benefício')).toBe('beneficio');
    expect(normalizarParaBusca('   Espécie   ')).toBe('especie');
  });
});

describe('apenasDigitos', () => {
  it('should extract only digits from formatted strings', () => {
    expect(apenasDigitos('042.318.765-17')).toBe('04231876517');
    expect(apenasDigitos('(41) 99123-4567')).toBe('41991234567');
    expect(apenasDigitos('128.456.789-0')).toBe('1284567890');
    expect(apenasDigitos('sem numeros')).toBe('');
  });
});

describe('atendeABusca', () => {
  it('should return true for empty search', () => {
    expect(atendeABusca(mockCliente, '', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '   ', mockProdutos)).toBe(true);
  });

  it('should match name case-insensitively and accent-insensitively', () => {
    expect(atendeABusca(mockCliente, 'jose', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'JOSÉ', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'raimundo', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'Santos', mockProdutos)).toBe(true);
  });

  it('should match multiple tokens (first and last name separated)', () => {
    expect(atendeABusca(mockCliente, 'Jose Santos', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'Santos Jose', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'Raimundo Curitiba', mockProdutos)).toBe(
      true,
    );
  });

  it('should match CPF with or without formatting', () => {
    expect(atendeABusca(mockCliente, '042.318', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '042318', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '04231876517', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '765-17', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '042 318', mockProdutos)).toBe(true);
  });

  it('should match NB with or without formatting', () => {
    expect(atendeABusca(mockCliente, '128.456', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '128456', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '1284567890', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, '789-0', mockProdutos)).toBe(true);
  });

  it('should match product / tese name and slug', () => {
    expect(atendeABusca(mockCliente, 'Excluidos', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'INSS', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'excluidos', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'RMC', mockProdutos)).toBe(false);
  });

  it('should match municipality and benefit species', () => {
    expect(atendeABusca(mockCliente, 'Curitiba', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'curitiba', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'Aposentadoria', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'aposentadoria', mockProdutos)).toBe(true);
  });

  it('should match judicial actions', () => {
    expect(atendeABusca(mockCliente, 'repetição em dobro', mockProdutos)).toBe(
      true,
    );
    expect(atendeABusca(mockCliente, 'repeticao', mockProdutos)).toBe(true);
    expect(atendeABusca(mockCliente, 'Sumula 479', mockProdutos)).toBe(true);
  });

  it('should return false when search term does not match any field', () => {
    expect(atendeABusca(mockCliente, 'Maria', mockProdutos)).toBe(false);
    expect(atendeABusca(mockCliente, '99999999999', mockProdutos)).toBe(false);
    expect(atendeABusca(mockCliente, 'Florianopolis', mockProdutos)).toBe(false);
  });
});

describe('atendeAoFiltro', () => {
  it('should correctly filter by status', () => {
    expect(atendeAoFiltro('ACAO', 'todos')).toBe(true);
    expect(atendeAoFiltro('ACAO', 'acao')).toBe(true);
    expect(atendeAoFiltro('PENDENTE', 'acao')).toBe(false);
    expect(atendeAoFiltro('PENDENTE', 'pendente')).toBe(true);
    expect(atendeAoFiltro('LIMPO_PRODUTO', 'limpo')).toBe(true);
    expect(atendeAoFiltro('LIMPO_CLIENTE', 'limpo')).toBe(true);
    expect(atendeAoFiltro('ARQUIVADO', 'limpo')).toBe(true);
  });
});
