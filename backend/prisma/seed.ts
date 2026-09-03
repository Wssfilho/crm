import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const schema = databaseUrl.searchParams.get('schema') ?? undefined;

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: databaseUrl.toString() },
    { schema },
  ),
});

const produtos = [
  {
    slug: 'excluidos',
    name: 'Excluídos 2021/2022',
    mono: 'EX',
    gradiente: 'linear-gradient(135deg,#4f46e5,#6366f1)',
  },
  {
    slug: 'ativos',
    name: 'Consignados Ativos',
    mono: 'CA',
    gradiente: 'linear-gradient(135deg,#0891b2,#0e7490)',
  },
  {
    slug: 'migrados',
    name: 'Migrados 23/26',
    mono: 'MG',
    gradiente: 'linear-gradient(135deg,#7c3aed,#9333ea)',
  },
];

const clientes = [
  {
    name: 'José Raimundo dos Santos',
    cpf: '042.318.765-17',
    idade: 72,
    nb: '128.456.789-0',
    produto: 'excluidos',
    status: 'ACAO',
    coluna: 'TRIADO',
    docs: 3,
    contratos: 2,
    valorEmCentavos: 1296000,
    acoes: [
      {
        name: 'Ação declaratória de inexistência de débito c/c repetição em dobro',
        base: 'CDC art. 42 · Súmula 479 STJ',
      },
      {
        name: 'Indenização por danos morais',
        base: 'CF art. 5º, X · CC art. 927',
      },
    ],
  },
  {
    name: 'Terezinha Gomes Barreto',
    cpf: '408.223.590-65',
    idade: 70,
    nb: '133.902.114-6',
    produto: 'ativos',
    status: 'ACAO',
    coluna: 'ANALISE',
    docs: 3,
    contratos: 1,
    valorEmCentavos: 820000,
    acoes: [
      {
        name: 'Ação revisional de juros c/c repetição de indébito',
        base: 'CDC art. 51, IV · taxa média BACEN',
      },
    ],
  },
  {
    name: 'Maria Aparecida de Souza',
    cpf: '517.204.933-91',
    idade: 68,
    nb: '142.887.001-5',
    produto: 'excluidos',
    status: 'LIMPO_PRODUTO',
    coluna: 'TRIADO',
    docs: 3,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
  {
    name: 'Antônio Carlos Ferreira',
    cpf: '330.145.678-25',
    idade: 75,
    nb: '131.552.400-9',
    produto: 'excluidos',
    status: 'ACAO',
    coluna: 'APTO',
    docs: 3,
    contratos: 1,
    valorEmCentavos: 578000,
    acoes: [
      {
        name: 'Ação declaratória de inexistência de débito c/c repetição em dobro',
        base: 'CDC art. 42 · Súmula 479 STJ',
      },
    ],
  },
  {
    name: 'João Batista de Oliveira',
    cpf: '219.770.334-07',
    idade: 66,
    nb: '149.221.885-3',
    produto: 'excluidos',
    status: 'LIMPO_CLIENTE',
    coluna: 'TRIADO',
    docs: 3,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
  {
    name: 'Raimundo Nonato da Silva',
    cpf: '317.905.226-09',
    idade: 74,
    nb: '129.440.771-8',
    produto: 'migrados',
    status: 'ACAO',
    coluna: 'APTO',
    docs: 3,
    contratos: 2,
    valorEmCentavos: 1300000,
    acoes: [
      {
        name: 'Ação revisional de portabilidade c/c repetição em dobro',
        base: 'CDC art. 42 · CC art. 422',
      },
    ],
  },
  {
    name: 'Cláudia Regina Alves',
    cpf: '512.008.443-51',
    idade: 63,
    nb: '158.220.900-1',
    produto: 'ativos',
    status: 'PENDENTE',
    coluna: 'ANALISE',
    docs: 3,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
  {
    name: 'Lúcia Helena Prado',
    cpf: '450.117.803-50',
    idade: 67,
    nb: '151.008.442-7',
    produto: 'migrados',
    status: 'PENDENTE',
    coluna: 'DOCS',
    docs: 2,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
  {
    name: 'Sebastiana Lima da Conceição',
    cpf: '604.882.117-43',
    idade: 81,
    nb: '156.003.771-2',
    produto: 'excluidos',
    status: 'PENDENTE',
    coluna: 'DOCS',
    docs: 1,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
  {
    name: 'Manoel dos Reis Filho',
    cpf: '221.640.877-80',
    idade: 69,
    nb: '140.771.220-4',
    produto: 'ativos',
    status: 'PENDENTE',
    coluna: 'NOVO',
    docs: 0,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
  {
    name: 'Edson Ferreira Lima',
    cpf: '208.554.331-67',
    idade: 71,
    nb: '134.660.221-3',
    produto: 'migrados',
    status: 'LIMPO_CLIENTE',
    coluna: 'TRIADO',
    docs: 3,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
  {
    name: 'Geralda Nunes de Matos',
    cpf: '188.402.771-70',
    idade: 78,
    nb: '126.114.880-5',
    produto: 'excluidos',
    status: 'PENDENTE',
    coluna: 'NOVO',
    docs: 0,
    contratos: 0,
    valorEmCentavos: 0,
    acoes: [],
  },
] as const;

const execucoes = [
  [4, 2],
  [6, 3],
  [3, 4],
  [7, 2],
  [5, 5],
  [8, 1],
  [2, 3],
  [6, 4],
  [9, 2],
  [5, 3],
];

/** O protótipo informa a idade; o modelo guarda a data de nascimento. */
function nascimentoParaIdade(idade: number) {
  const hoje = new Date();

  return new Date(
    Date.UTC(hoje.getUTCFullYear() - idade, hoje.getUTCMonth(), hoje.getUTCDate()),
  );
}

/** Marca os N primeiros documentos como anexados, na ordem do formulário. */
function documentosAnexados(docs: number) {
  return {
    procuracao: docs >= 1,
    extratoBeneficio: docs >= 2,
    extratoEmprestimos: docs >= 3,
  };
}

function diaUtcRelativo(diasAtras: number) {
  const hoje = new Date();
  const data = new Date(
    Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()),
  );

  data.setUTCDate(data.getUTCDate() - diasAtras);

  return data;
}

async function seed() {
  await prisma.acaoJudicial.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.execucaoDiaria.deleteMany();
  await prisma.workflow.deleteMany();

  const criados = new Map<string, string>();

  for (const produto of produtos) {
    const { id } = await prisma.produto.create({ data: produto });

    criados.set(produto.slug, id);
  }

  for (const cliente of clientes) {
    const { acoes, produto, idade, docs, ...dados } = cliente;

    await prisma.cliente.create({
      data: {
        ...dados,
        nascimento: nascimentoParaIdade(idade),
        ...documentosAnexados(docs),
        produtoId: criados.get(produto)!,
        acoes: {
          create: acoes.map((acao, indice) => ({ ...acao, ordem: indice + 1 })),
        },
      },
    });
  }

  for (const [indice, [comAcao, semIrregularidade]] of execucoes.entries()) {
    await prisma.execucaoDiaria.create({
      data: {
        data: diaUtcRelativo(execucoes.length - 1 - indice),
        comAcao,
        semIrregularidade,
      },
    });
  }

  await prisma.workflow.create({
    data: {
      nome: 'triagem-consignado-v3',
      ativo: true,
      sincronizadoEm: new Date(Date.now() - 1000 * 60 * 4),
    },
  });

  console.log(
    `Seed: ${produtos.length} produtos, ${clientes.length} clientes, ${execucoes.length} execuções, 1 workflow.`,
  );
}

seed()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
