-- Add Clerk identity fields for safe app-database user sync.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");
