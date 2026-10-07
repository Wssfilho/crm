-- CreateEnum
CREATE TYPE "etapa_cliente" AS ENUM ('COMERCIAL', 'PROTOCOLO', 'CONCLUIDO');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "drive_url" TEXT,
ADD COLUMN     "etapa" "etapa_cliente" NOT NULL DEFAULT 'COMERCIAL',
ADD COLUMN     "movido_em" TIMESTAMP(3),
ADD COLUMN     "movido_por_id" TEXT,
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "responsavel_id" TEXT;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_movido_por_id_fkey" FOREIGN KEY ("movido_por_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
