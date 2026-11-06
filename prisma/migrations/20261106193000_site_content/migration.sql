-- Editable site copy. Draft stays private. Published is what the public pages read.

CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SiteContent_updatedAt_idx" ON "SiteContent"("updatedAt");
