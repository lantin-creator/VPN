/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `BalanceTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BalanceTransaction" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BalanceTransaction_idempotencyKey_key" ON "BalanceTransaction"("idempotencyKey");
