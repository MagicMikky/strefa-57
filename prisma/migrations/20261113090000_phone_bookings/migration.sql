ALTER TABLE "Inquiry" ADD COLUMN "allowSharing" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "BusinessProfile"
  ADD COLUMN "registeredStreet" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "registeredPostalCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "registeredCity" TEXT NOT NULL DEFAULT '';

ALTER TABLE "BusinessSettings"
  ADD COLUMN "minPlayersPerBooking" INTEGER NOT NULL DEFAULT 8,
  ADD COLUMN "campfirePrice" TEXT,
  ADD COLUMN "grillPrice" TEXT;

DROP INDEX "ConfirmedSlot_date_slot_key";
ALTER TABLE "ConfirmedSlot"
  ALTER COLUMN "inquiryId" DROP NOT NULL,
  ADD COLUMN "players" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "privateSlot" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'inquiry',
  ADD COLUMN "contactName" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "ConfirmedSlot" AS booking
SET "players" = inquiry."playerCount"
FROM "Inquiry" AS inquiry
WHERE booking."inquiryId" = inquiry."id";

-- Keep orphaned legacy confirmations exclusive, even when the original inquiry is absent.
UPDATE "ConfirmedSlot" SET "players" = 50 WHERE "players" = 0;
CREATE INDEX "ConfirmedSlot_date_slot_cancelledAt_idx" ON "ConfirmedSlot"("date", "slot", "cancelledAt");

-- The owner-approved schedule replaces the previous published defaults. Existing
-- date/slot blocks remain in JSON and are interpreted as overlapping closures.
UPDATE "BusinessSettings"
SET "maxTeamsPerMatch" = 8,
    "maxPlayersPerSlot" = 50,
    "slotStartTimes" = '10:00,12:00,15:00,18:00',
    "slotBufferMinutes" = 0,
    "depositAmount" = '500.00',
    "campfirePrice" = '200.00',
    "grillPrice" = '200.00',
    "version" = "version" + 1
WHERE "id" IN ('draft', 'published');

UPDATE "ScheduleCatalog"
SET "body" = jsonb_set("body", '{weekdays}', '["pn","wt","sr","cz","pt","sb","nd"]'::jsonb),
    "version" = "version" + 1
WHERE "id" IN ('draft', 'published');

UPDATE "BusinessContact"
SET "phoneDisplay" = '577 203 783',
    "phoneHref" = 'tel:577203783',
    "emailDisplay" = 'strefapaintball@icloud.com',
    "emailHref" = 'mailto:strefapaintball@icloud.com',
    "hours" = 'Gry codziennie przez cały rok, po uzgodnieniu terminu',
    "version" = "version" + 1
WHERE "id" IN ('draft', 'published');
