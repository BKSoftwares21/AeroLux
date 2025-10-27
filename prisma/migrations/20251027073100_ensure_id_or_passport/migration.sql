-- Ensure id_or_passport column exists on users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "id_or_passport" TEXT;