CREATE TABLE "ConfirmedSlot" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfirmedSlot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConfirmedSlot_inquiryId_key" ON "ConfirmedSlot"("inquiryId");
CREATE UNIQUE INDEX "ConfirmedSlot_date_slot_key" ON "ConfirmedSlot"("date", "slot");
CREATE INDEX "ConfirmedSlot_date_idx" ON "ConfirmedSlot"("date");
