-- Company configuration. Draft rows stay private. Published rows are the public snapshot.

CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "legalName" TEXT NOT NULL DEFAULT '',
    "taxId" TEXT NOT NULL DEFAULT '',
    "street" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "dataController" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "mapNote" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessContact" (
    "id" TEXT NOT NULL,
    "phoneDisplay" TEXT NOT NULL,
    "phoneHref" TEXT NOT NULL DEFAULT '',
    "emailDisplay" TEXT NOT NULL,
    "emailHref" TEXT NOT NULL DEFAULT '',
    "hours" TEXT NOT NULL,
    "socialText" TEXT NOT NULL DEFAULT '',
    "directions" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "BusinessContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL,
    "maxPlayersPerTeam" INTEGER NOT NULL,
    "minTeamsPerMatch" INTEGER NOT NULL,
    "maxTeamsPerMatch" INTEGER NOT NULL,
    "maxPlayersPerSlot" INTEGER NOT NULL,
    "slotStartTimes" TEXT NOT NULL,
    "slotDurationMinutes" INTEGER NOT NULL,
    "slotBufferMinutes" INTEGER NOT NULL,
    "allowSharedSlot" BOOLEAN NOT NULL,
    "allowPrivateSlot" BOOLEAN NOT NULL,
    "equipmentSets" INTEGER,
    "depositAmount" TEXT,
    "privateSlotSurcharge" TEXT,
    "paymentProvider" TEXT,
    "cancellationPolicy" TEXT,
    "commercialApproved" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConfigChangeAudit" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfigChangeAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BusinessProfile_updatedAt_idx" ON "BusinessProfile"("updatedAt");
CREATE INDEX "BusinessContact_updatedAt_idx" ON "BusinessContact"("updatedAt");
CREATE INDEX "BusinessSettings_updatedAt_idx" ON "BusinessSettings"("updatedAt");
CREATE INDEX "ContentRevision_entity_createdAt_idx" ON "ContentRevision"("entity", "createdAt");
CREATE INDEX "ContentRevision_actorId_idx" ON "ContentRevision"("actorId");
CREATE INDEX "ConfigChangeAudit_createdAt_idx" ON "ConfigChangeAudit"("createdAt");
CREATE INDEX "ConfigChangeAudit_actorId_idx" ON "ConfigChangeAudit"("actorId");

ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConfigChangeAudit" ADD CONSTRAINT "ConfigChangeAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed from the already public marketing facts. Legal identity, phone and email stay empty.
INSERT INTO "BusinessProfile" ("id", "tradeName", "legalName", "taxId", "street", "postalCode", "city", "region", "country", "dataController", "description", "mapNote", "version", "updatedAt")
SELECT slot, 'Paintball Strefa 29', '', '', 'Żurawia 29', '80-298', 'Czaple', 'pomorskie', 'PL', '',
       'Terenowe pole paintballowe w Czaplach koło Gdańska. Okopy, bunkry, ambony i scenariusz z rakietą V2.',
       'Dokładną instrukcję wjazdu otrzymasz po uzgodnieniu terminu.', 1, CURRENT_TIMESTAMP
FROM (VALUES ('draft'), ('published')) AS slots(slot);

INSERT INTO "BusinessContact" ("id", "phoneDisplay", "phoneHref", "emailDisplay", "emailHref", "hours", "socialText", "directions", "version", "updatedAt")
SELECT slot, 'Numer telefonu do potwierdzenia', '', 'E-mail do potwierdzenia', '',
       'Gry i kontakt po wcześniejszym uzgodnieniu', '',
       'Dokładną instrukcję wjazdu otrzymasz po uzgodnieniu terminu.', 1, CURRENT_TIMESTAMP
FROM (VALUES ('draft'), ('published')) AS slots(slot);

INSERT INTO "BusinessSettings" (
    "id", "maxPlayersPerTeam", "minTeamsPerMatch", "maxTeamsPerMatch", "maxPlayersPerSlot",
    "slotStartTimes", "slotDurationMinutes", "slotBufferMinutes", "allowSharedSlot", "allowPrivateSlot",
    "commercialApproved", "version", "updatedAt"
)
SELECT slot, 8, 2, 4, 32, '08:00,11:00,14:00', 120, 60, true, true, false, 1, CURRENT_TIMESTAMP
FROM (VALUES ('draft'), ('published')) AS slots(slot);
