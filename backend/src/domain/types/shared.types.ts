// ── RESERVATIONS ─────────────────────────────────────────────

export type ReservationStatus = 'active' | 'completed' | 'expired';

export interface Reservation {
  id:         string;
  product_id: string;
  buyer_id:   string;
  fee_paid:   number;
  status:     ReservationStatus;
  expires_at: Date;
  created_at: Date;
}

// ── TRANSACTIONS ─────────────────────────────────────────────

export interface Transaction {
  id:             string;
  product_id:     string;
  seller_id:      string;
  buyer_id:       string;
  chat_id:        string;
  reservation_id: string | null;
  final_price:    number;
  confirmed_at:   Date;
  created_at:     Date;
}

// ── NOTIFICATIONS ─────────────────────────────────────────────

export type NotificationType =
  | 'reservation_confirmed'
  | 'reservation_expiring'
  | 'reservation_expired'
  | 'product_approved'
  | 'new_message'
  | 'new_interested'
  | 'sale_completed'
  | 'purchase_completed'
  | 'admin_published';

export type NotificationRef = 'product' | 'chat' | 'reservation' | 'transaction';

export interface Notification {
  id:             string;
  user_id:        string;
  type:           NotificationType;
  title:          string;
  description:    string | null;
  is_read:        boolean;
  reference_id:   string | null;
  reference_type: NotificationRef | null;
  created_at:     Date;
}
