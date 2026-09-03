/*
  Warnings:

  - You are about to drop the column `docs` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `idade` on the `clientes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "docs",
DROP COLUMN "idade",
ADD COLUMN     "especie" TEXT,
ADD COLUMN     "extrato_beneficio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "extrato_emprestimos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "nascimento" DATE,
ADD COLUMN     "procuracao" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "renda_em_centavos" INTEGER,
ADD COLUMN     "telefone" TEXT;
