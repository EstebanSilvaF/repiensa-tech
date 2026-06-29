-- CreateEnum
CREATE TYPE "message_type" AS ENUM ('text', 'appointment');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "type" "message_type" NOT NULL DEFAULT 'text';
