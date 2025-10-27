-- Add user profile fields
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "date_of_birth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "id_or_passport" TEXT,
  ADD COLUMN IF NOT EXISTS "department" TEXT,
  ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3);
