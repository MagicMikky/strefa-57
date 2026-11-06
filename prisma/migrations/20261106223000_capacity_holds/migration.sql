CREATE TABLE "CapacityHold" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "players" INTEGER NOT NULL,
    "teams" INTEGER NOT NULL,
    "privateSlot" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapacityHold_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CapacityHold_idempotencyKey_key" ON "CapacityHold"("idempotencyKey");

CREATE INDEX "CapacityHold_date_slot_expiresAt_idx" ON "CapacityHold"("date", "slot", "expiresAt");
