-- Weekly template and blocked dates. Draft is private. Nothing here sells or calculates free seats.

CREATE TABLE "ScheduleCatalog" (
    "id" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "ScheduleCatalog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScheduleCatalog_updatedAt_idx" ON "ScheduleCatalog"("updatedAt");
