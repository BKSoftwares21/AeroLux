-- Add capacity and seats_available to flights
ALTER TABLE "flights" ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "flights" ADD COLUMN "seats_available" INTEGER NOT NULL DEFAULT 0;

-- Add flight_id and passengers to bookings and FK
ALTER TABLE "bookings" ADD COLUMN "flight_id" INTEGER;
ALTER TABLE "bookings" ADD COLUMN "passengers" INTEGER;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_flight_id_fkey"
  FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE SET NULL ON UPDATE CASCADE;
