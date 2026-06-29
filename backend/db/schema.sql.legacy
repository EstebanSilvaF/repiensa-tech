-- ============================================================
-- RE-PENSA TECH — DATABASE SCHEMA
-- PostgreSQL
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE user_role            AS ENUM ('student', 'admin');
CREATE TYPE product_condition    AS ENUM ('new', 'good', 'regular');
CREATE TYPE product_status       AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE product_category     AS ENUM (
  'microcontrollers',
  'sensors',
  'memory',
  'displays',
  'cables',
  'power',
  'other'
);
CREATE TYPE reservation_status   AS ENUM ('active', 'completed', 'expired');
CREATE TYPE chat_status          AS ENUM ('open', 'delivery_confirmed');
CREATE TYPE notification_type    AS ENUM (
  'reservation_confirmed',
  'reservation_expiring',
  'reservation_expired',
  'product_approved',
  'new_message',
  'new_interested',
  'sale_completed',
  'purchase_completed',
  'admin_published'
);
CREATE TYPE notification_ref     AS ENUM ('product', 'chat', 'reservation', 'transaction');

-- ============================================================
-- UNIVERSITIES
-- ============================================================

CREATE TABLE universities (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(200)  NOT NULL,
  email_domain        VARCHAR(100)  NOT NULL UNIQUE,  -- ej: unal.edu.co
  subscription_status subscription_status NOT NULL DEFAULT 'inactive',
  subscription_start  DATE,
  subscription_end    DATE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_subscription_dates
    CHECK (subscription_end IS NULL OR subscription_end > subscription_start)
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id  UUID         NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
  full_name      VARCHAR(150) NOT NULL,
  email          VARCHAR(254) NOT NULL UNIQUE,
  password_hash  TEXT         NOT NULL,
  role           user_role    NOT NULL DEFAULT 'student',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_university ON users(university_id);
CREATE INDEX idx_users_email      ON users(email);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
  id             UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id      UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  university_id  UUID              NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
  name           VARCHAR(200)      NOT NULL,
  description    TEXT,
  price          NUMERIC(10, 2)    NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_donation    BOOLEAN           NOT NULL DEFAULT FALSE,
  category       product_category  NOT NULL,
  condition      product_condition NOT NULL,
  status            product_status    NOT NULL DEFAULT 'available',
  image_url         TEXT            NOT NULL,
  image_public_id   TEXT,
  created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  -- Si es donación el precio debe ser 0
  CONSTRAINT chk_donation_price
    CHECK (is_donation = FALSE OR price = 0)
);

CREATE INDEX idx_products_seller     ON products(seller_id);
CREATE INDEX idx_products_university ON products(university_id);
CREATE INDEX idx_products_status     ON products(status);
CREATE INDEX idx_products_category   ON products(category);

-- ============================================================
-- RESERVATIONS
-- ============================================================

CREATE TABLE reservations (
  id          UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID               NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  buyer_id    UUID               NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  fee_paid    NUMERIC(10, 2)     NOT NULL CHECK (fee_paid > 0),
  status      reservation_status NOT NULL DEFAULT 'active',
  expires_at  TIMESTAMPTZ        NOT NULL,
  created_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  -- Un producto solo puede tener una reserva activa a la vez
  CONSTRAINT uq_product_active_reservation
    UNIQUE NULLS NOT DISTINCT (product_id, status),

  CONSTRAINT chk_expires_future
    CHECK (expires_at > created_at)
);

CREATE INDEX idx_reservations_product ON reservations(product_id);
CREATE INDEX idx_reservations_buyer   ON reservations(buyer_id);
CREATE INDEX idx_reservations_status  ON reservations(status);
CREATE INDEX idx_reservations_expires ON reservations(expires_at);

-- ============================================================
-- CHATS
-- ============================================================

CREATE TABLE chats (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  buyer_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  seller_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status      chat_status NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Comprador y vendedor deben ser distintos
  CONSTRAINT chk_buyer_not_seller
    CHECK (buyer_id <> seller_id),

  -- Un comprador solo puede tener un chat abierto por producto
  CONSTRAINT uq_chat_per_product_buyer
    UNIQUE (product_id, buyer_id)
);

CREATE INDEX idx_chats_product  ON chats(product_id);
CREATE INDEX idx_chats_buyer    ON chats(buyer_id);
CREATE INDEX idx_chats_seller   ON chats(seller_id);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE messages (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id     UUID        NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content     TEXT        NOT NULL CHECK (char_length(content) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_chat   ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================

CREATE TABLE transactions (
  id              UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  seller_id       UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  buyer_id        UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  chat_id         UUID           NOT NULL REFERENCES chats(id) ON DELETE RESTRICT,
  reservation_id  UUID           REFERENCES reservations(id) ON DELETE SET NULL,
  final_price     NUMERIC(10, 2) NOT NULL CHECK (final_price >= 0),
  confirmed_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  -- Un producto solo puede tener una transacción completada
  CONSTRAINT uq_product_transaction
    UNIQUE (product_id),

  CONSTRAINT chk_tx_buyer_not_seller
    CHECK (buyer_id <> seller_id)
);

CREATE INDEX idx_transactions_product     ON transactions(product_id);
CREATE INDEX idx_transactions_seller      ON transactions(seller_id);
CREATE INDEX idx_transactions_buyer       ON transactions(buyer_id);
CREATE INDEX idx_transactions_reservation ON transactions(reservation_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id             UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           notification_type NOT NULL,
  title          VARCHAR(200)      NOT NULL,
  description    TEXT,
  is_read        BOOLEAN           NOT NULL DEFAULT FALSE,
  reference_id   UUID,
  reference_type notification_ref,
  created_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  -- Si hay referencia, debe tener los dos campos
  CONSTRAINT chk_reference_complete
    CHECK (
      (reference_id IS NULL AND reference_type IS NULL) OR
      (reference_id IS NOT NULL AND reference_type IS NOT NULL)
    )
);

CREATE INDEX idx_notifications_user    ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- FUNCIÓN: expirar reservas vencidas
-- Llamar con un cron job o pg_cron cada hora
-- UPDATE reservations SET status = 'expired'
-- WHERE status = 'active' AND expires_at < NOW();
-- Y devolver el producto a 'available':
-- UPDATE products SET status = 'available'
-- WHERE id IN (SELECT product_id FROM reservations WHERE status = 'expired')
-- AND status = 'reserved';
-- ============================================================
