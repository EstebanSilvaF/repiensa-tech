export type ChatStatus = 'open' | 'delivery_confirmed';
export type MessageType = 'text' | 'appointment';
export type AppointmentStatus = 'pending' | 'accepted' | 'rejected';

export interface Chat {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: ChatStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  type: MessageType;
  content: string;
  appointment_status?: AppointmentStatus | null;
  appointment_day?: string | null;
  appointment_time?: string | null;
  appointment_location?: string | null;
  created_at: Date;
}

export interface AppointmentPayload {
  day: string;
  time: string;
  location: string;
}

export interface SendMessageDTO {
  content?: string;
  type?: MessageType;
  appointment?: AppointmentPayload;
}

export type AppointmentResponseAction = 'accept' | 'reject';

export interface RespondAppointmentDTO {
  action: AppointmentResponseAction;
}

export interface ChatUpdatedPayload {
  id: string;
  status: ChatStatus;
  last_message?: string | null;
  last_message_at?: Date | null;
}
