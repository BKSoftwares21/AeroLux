-- Drop department column from users table if it exists
ALTER TABLE "users"
  DROP COLUMN IF EXISTS "department";