export type UserRole = 'student' | 'admin'

export type ProductCondition = 'new' | 'good' | 'regular'
export type ProductStatus = 'available' | 'reserved' | 'sold'
export type ProductCategory =
  | 'microcontrollers'
  | 'sensors'
  | 'memory'
  | 'displays'
  | 'cables'
  | 'power'
  | 'other'

export type SubscriptionStatus = 'active' | 'inactive' | 'expired'

export interface User {
  id: string
  university_id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface University {
  id: string
  name: string
  email_domain: string
  subscription_status: SubscriptionStatus
  subscription_start: string
  subscription_end: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  seller_id: string
  university_id: string
  name: string
  description: string | null
  price: number
  is_donation: boolean
  category: ProductCategory
  condition: ProductCondition
  status: ProductStatus
  image_url: string
  image_public_id: string | null
  created_at: string
  updated_at: string
  seller_name?: string
  seller_email?: string
}

export interface UploadProductImageResponse {
  image_url: string
  image_public_id: string
  width: number
  height: number
}

export interface GenerateProductDescriptionResponse {
  name: string
  description: string
  category: ProductCategory
  condition: ProductCondition
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  is_donation: boolean
  category: ProductCategory
  condition: ProductCondition
  image_url: string
  image_public_id?: string
}

export interface RegisterRequest {
  university_id: string
  full_name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
  user: User
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ProductFilters {
  category?: ProductCategory
  condition?: ProductCondition
  is_donation?: boolean
  search?: string
}

export type TransactionType = 'purchase' | 'sale' | 'donation'
export type TransactionStatus = 'reserved' | 'completed' | 'donated'
export type TransactionFilter = 'all' | TransactionType
export type TransactionDirection = 'purchase' | 'sale'
export type ReservationStatus = 'active' | 'completed' | 'expired'

export interface Transaction {
  id: string
  product_name: string
  image_url?: string | null
  type: TransactionType
  date: string
  counterparty_name: string
  amount: number
  status: TransactionStatus
}

export interface ApiTransaction {
  id: string
  product_id: string
  seller_id: string
  buyer_id: string
  chat_id: string
  reservation_id: string | null
  final_price: number
  confirmed_at: string
  created_at: string
  product_name?: string
  product_image?: string | null
  product_category?: ProductCategory
  buyer_name?: string
  seller_name?: string
  direction?: TransactionDirection
}

export interface Reservation {
  id: string
  product_id: string
  buyer_id: string
  fee_paid: number
  status: ReservationStatus
  expires_at: string
  created_at: string
  product_name?: string
  product_image?: string | null
  product_price?: number
}

export interface ReserveProductRequest {
  product_id: string
}

export interface HistorySummary {
  purchases_count: number
  sales_count: number
  savings_total: number
}

export type ChatStatus = 'open' | 'delivery_confirmed'

export interface Chat {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  status: ChatStatus
  created_at: string
  updated_at: string
  product_name?: string
  product_price?: number
  product_image?: string | null
  buyer_name?: string
  seller_name?: string
  buyer_university_name?: string
  seller_university_name?: string
  last_message?: string | null
  last_message_at?: string | null
}

export type MessageType = 'text' | 'appointment'
export type AppointmentStatus = 'pending' | 'accepted' | 'rejected'

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  type: MessageType
  content: string
  appointment_status?: AppointmentStatus | null
  appointment_day?: string | null
  appointment_time?: string | null
  appointment_location?: string | null
  created_at: string
  sender_name?: string
}

export interface AppointmentPayload {
  day: string
  time: string
  location: string
}

export type AppointmentResponseAction = 'accept' | 'reject'

export interface RespondAppointmentRequest {
  action: AppointmentResponseAction
}

export interface SendMessageRequest {
  content?: string
  type?: MessageType
  appointment?: AppointmentPayload
}

export interface ChatUpdatedPayload {
  id: string
  status: ChatStatus
  last_message?: string | null
  last_message_at?: string | null
}

export interface OpenChatRequest {
  product_id: string
}

export interface ConfirmDeliveryResponse {
  message: string
}
