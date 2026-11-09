-- CreateTable
CREATE TABLE "VpnKeyRegeneration" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VpnKeyRegeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VpnKeyRegeneration_subscriptionId_createdAt_idx" ON "VpnKeyRegeneration"("subscriptionId", "createdAt");

-- AddForeignKey
ALTER TABLE "VpnKeyRegeneration" ADD CONSTRAINT "VpnKeyRegeneration_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
