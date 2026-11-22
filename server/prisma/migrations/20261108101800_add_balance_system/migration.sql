-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BalanceTransactionType" AS ENUM ('TOP_UP', 'SUBSCRIPTION_PAYMENT', 'REFUND');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "frozenBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BalanceReservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reservationId" TEXT,
    "type" "BalanceTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BalanceReservation_idempotencyKey_key" ON "BalanceReservation"("idempotencyKey");

-- CreateIndex
CREATE INDEX "BalanceReservation_userId_status_idx" ON "BalanceReservation"("userId", "status");

-- CreateIndex
CREATE INDEX "BalanceTransaction_userId_createdAt_idx" ON "BalanceTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BalanceTransaction_reservationId_idx" ON "BalanceTransaction"("reservationId");

-- AddForeignKey
ALTER TABLE "BalanceReservation" ADD CONSTRAINT "BalanceReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "BalanceReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
