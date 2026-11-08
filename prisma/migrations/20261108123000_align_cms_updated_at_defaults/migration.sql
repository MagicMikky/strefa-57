-- Prisma manages these timestamps through @updatedAt. The original CMS
-- migrations also added database defaults, which caused schema drift.
ALTER TABLE "BusinessProfile" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "BusinessContact" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "BusinessSettings" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "SiteContent" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "GalleryCatalog" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "ScheduleCatalog" ALTER COLUMN "updatedAt" DROP DEFAULT;
