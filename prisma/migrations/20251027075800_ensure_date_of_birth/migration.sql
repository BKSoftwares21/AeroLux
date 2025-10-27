-- Ensure date_of_birth column exists on users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "date_of_birth" TIMESTAMP(3);