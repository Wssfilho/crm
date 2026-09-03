-- CreateEnum
CREATE TYPE "status_triagem" AS ENUM ('ACAO', 'PENDENTE', 'LIMPO_PRODUTO', 'LIMPO_CLIENTE');

-- CreateEnum
CREATE TYPE "coluna_kanban" AS ENUM ('NOVO', 'DOCS', 'ANALISE', 'TRIADO', 'APTO');

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mono" TEXT NOT NULL,
    "gradiente" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "nb" TEXT NOT NULL,
    "status" "status_triagem" NOT NULL,
    "coluna" "coluna_kanban" NOT NULL,
    "docs" INTEGER NOT NULL DEFAULT 0,
    "contratos" INTEGER NOT NULL DEFAULT 0,
    "valor_em_centavos" INTEGER NOT NULL DEFAULT 0,
    "arquivada" BOOLEAN NOT NULL DEFAULT false,
    "produto_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acoes_judiciais" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "cliente_id" TEXT NOT NULL,

    CONSTRAINT "acoes_judiciais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execucoes_diarias" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "com_acao" INTEGER NOT NULL,
    "sem_irregularidade" INTEGER NOT NULL,

    CONSTRAINT "execucoes_diarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "sincronizado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produtos_slug_key" ON "produtos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "execucoes_diarias_data_key" ON "execucoes_diarias"("data");

-- CreateIndex
CREATE UNIQUE INDEX "workflows_nome_key" ON "workflows"("nome");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acoes_judiciais" ADD CONSTRAINT "acoes_judiciais_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
