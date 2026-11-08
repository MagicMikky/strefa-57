ALTER TABLE "NotificationOutbox"
ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "leaseToken" TEXT,
ADD COLUMN "leaseExpiresAt" TIMESTAMP(3);

DROP INDEX "NotificationOutbox_status_createdAt_idx";

CREATE INDEX "NotificationOutbox_status_nextAttemptAt_leaseExpiresAt_idx"
ON "NotificationOutbox"("status", "nextAttemptAt", "leaseExpiresAt");
