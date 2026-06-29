-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'inactive', 'expired');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "product_condition" AS ENUM ('new', 'good', 'regular');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('available', 'reserved', 'sold');

-- CreateEnum
CREATE TYPE "product_category" AS ENUM ('microcontrollers', 'sensors', 'memory', 'displays', 'cables', 'power', 'other');

-- CreateEnum
CREATE TYPE "reservation_status" AS ENUM ('active', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "chat_status" AS ENUM ('open', 'delivery_confirmed');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('reservation_confirmed', 'reservation_expiring', 'reservation_expired', 'product_approved', 'new_message', 'new_interested', 'sale_completed', 'purchase_completed', 'admin_published');

-- CreateEnum
CREATE TYPE "notification_ref" AS ENUM ('product', 'chat', 'reservation', 'transaction');

-- CreateTable
CREATE TABLE "universities" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(200) NOT NULL,
    "email_domain" VARCHAR(100) NOT NULL,
    "subscription_status" "subscription_status" NOT NULL DEFAULT 'inactive',
    "subscription_start" DATE,
    "subscription_end" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "university_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "seller_id" UUID NOT NULL,
    "university_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_donation" BOOLEAN NOT NULL DEFAULT false,
    "category" "product_category" NOT NULL,
    "condition" "product_condition" NOT NULL,
    "status" "product_status" NOT NULL DEFAULT 'available',
    "image_url" TEXT NOT NULL,
    "image_public_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "fee_paid" DECIMAL(10,2) NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "status" "chat_status" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "chat_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "chat_id" UUID NOT NULL,
    "reservation_id" UUID,
    "final_price" DECIMAL(10,2) NOT NULL,
    "confirmed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "reference_id" UUID,
    "reference_type" "notification_ref",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_email_domain_key" ON "universities"("email_domain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_university" ON "users"("university_id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_products_seller" ON "products"("seller_id");

-- CreateIndex
CREATE INDEX "idx_products_university" ON "products"("university_id");

-- CreateIndex
CREATE INDEX "idx_products_status" ON "products"("status");

-- CreateIndex
CREATE INDEX "idx_products_category" ON "products"("category");

-- CreateIndex
CREATE INDEX "idx_reservations_product" ON "reservations"("product_id");

-- CreateIndex
CREATE INDEX "idx_reservations_buyer" ON "reservations"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_reservations_status" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "idx_reservations_expires" ON "reservations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_product_active_reservation" ON "reservations"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_chats_product" ON "chats"("product_id");

-- CreateIndex
CREATE INDEX "idx_chats_buyer" ON "chats"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_chats_seller" ON "chats"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_chat_per_product_buyer" ON "chats"("product_id", "buyer_id");

-- CreateIndex
CREATE INDEX "idx_messages_chat" ON "messages"("chat_id");

-- CreateIndex
CREATE INDEX "idx_messages_sender" ON "messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_product_id_key" ON "transactions"("product_id");

-- CreateIndex
CREATE INDEX "idx_transactions_seller" ON "transactions"("seller_id");

-- CreateIndex
CREATE INDEX "idx_transactions_buyer" ON "transactions"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_transactions_reservation" ON "transactions"("reservation_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("user_id", "is_read");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CHECK constraints (not modeled by Prisma)
ALTER TABLE "universities" ADD CONSTRAINT "chk_subscription_dates"
  CHECK (subscription_end IS NULL OR subscription_end > subscription_start);

ALTER TABLE "products" ADD CONSTRAINT "chk_donation_price"
  CHECK (is_donation = FALSE OR price = 0);

ALTER TABLE "products" ADD CONSTRAINT "chk_price_non_negative"
  CHECK (price >= 0);

ALTER TABLE "reservations" ADD CONSTRAINT "chk_fee_paid_positive"
  CHECK (fee_paid > 0);

ALTER TABLE "reservations" ADD CONSTRAINT "chk_expires_future"
  CHECK (expires_at > created_at);

ALTER TABLE "chats" ADD CONSTRAINT "chk_buyer_not_seller"
  CHECK (buyer_id <> seller_id);

ALTER TABLE "messages" ADD CONSTRAINT "chk_content_not_empty"
  CHECK (char_length(content) > 0);

ALTER TABLE "transactions" ADD CONSTRAINT "chk_final_price_non_negative"
  CHECK (final_price >= 0);

ALTER TABLE "transactions" ADD CONSTRAINT "chk_tx_buyer_not_seller"
  CHECK (buyer_id <> seller_id);

ALTER TABLE "notifications" ADD CONSTRAINT "chk_reference_complete"
  CHECK (
    (reference_id IS NULL AND reference_type IS NULL) OR
    (reference_id IS NOT NULL AND reference_type IS NOT NULL)
  );
