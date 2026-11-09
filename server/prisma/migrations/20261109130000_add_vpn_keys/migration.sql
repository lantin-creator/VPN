CREATE TYPE "VpnKeyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

CREATE TABLE "VpnKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "VpnKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpnKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VpnKey_key_key" ON "VpnKey"("key");
CREATE INDEX "VpnKey_userId_status_idx" ON "VpnKey"("userId", "status");
CREATE INDEX "VpnKey_subscriptionId_idx" ON "VpnKey"("subscriptionId");
CREATE INDEX "VpnKey_status_expiresAt_idx" ON "VpnKey"("status", "expiresAt");

ALTER TABLE "VpnKey" ADD CONSTRAINT "VpnKey_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VpnKey" ADD CONSTRAINT "VpnKey_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
