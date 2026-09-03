-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_produto_id_fkey";

-- AlterTable
ALTER TABLE "clientes" ALTER COLUMN "produto_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
