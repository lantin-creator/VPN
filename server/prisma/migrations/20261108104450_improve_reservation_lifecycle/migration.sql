/*
  Warnings:

  - Added the required column `expiresAt` to the `BalanceReservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "BalanceReservation" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
