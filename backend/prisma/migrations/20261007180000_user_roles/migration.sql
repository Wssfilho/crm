-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'USER';

-- Contas existentes antes dos papéis viram administradoras
UPDATE "users" SET "role" = 'ADMIN';
