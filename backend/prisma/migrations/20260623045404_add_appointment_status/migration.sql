-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "appointment_day" VARCHAR(100),
ADD COLUMN     "appointment_location" VARCHAR(200),
ADD COLUMN     "appointment_status" "appointment_status",
ADD COLUMN     "appointment_time" VARCHAR(50);

-- Mensajes de encuentro previos se consideran ya acordados
UPDATE "messages"
SET "appointment_status" = 'accepted'
WHERE "type" = 'appointment' AND "appointment_status" IS NULL;
