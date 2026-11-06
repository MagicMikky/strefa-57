-- Existing staff rows keep their role. New identities default to no staff access.
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'member';
