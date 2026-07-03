-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "reservations_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT IF EXISTS "chats_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT IF EXISTS "chats_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_user_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "users";

-- DropEnum
DROP TYPE IF EXISTS "user_role";
