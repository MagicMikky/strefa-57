-- Gallery order, captions and categories. Draft is private. Published drives the public reel.

CREATE TABLE "GalleryCatalog" (
    "id" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    CONSTRAINT "GalleryCatalog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GalleryCatalog_updatedAt_idx" ON "GalleryCatalog"("updatedAt");
