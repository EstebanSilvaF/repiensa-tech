import { ChatUpdatedPayload, Message } from '../../domain/types/chat.types';
import { getIo } from './socket';

export function emitMessageUpdated(
  chatId: string,
  message: Message & { sender_name?: string }
): void {
  getIo().to(`chat:${chatId}`).emit('message:updated', message);
}

export function emitMessageNew(chatId: string, message: Message & { sender_name?: string }): void {
  getIo().to(`chat:${chatId}`).emit('message:new', message);
}

export function emitChatUpdated(
  buyerId: string,
  sellerId: string,
  payload: ChatUpdatedPayload
): void {
  const io = getIo();
  io.to(`user:${buyerId}`).emit('chat:updated', payload);
  io.to(`user:${sellerId}`).emit('chat:updated', payload);
}

export function emitChatDeliveryConfirmed(
  chatId: string,
  buyerId: string,
  sellerId: string
): void {
  const payload = { chatId, status: 'delivery_confirmed' as const };
  const io = getIo();
  io.to(`chat:${chatId}`).emit('chat:delivery_confirmed', payload);
  io.to(`user:${buyerId}`).emit('chat:delivery_confirmed', payload);
  io.to(`user:${sellerId}`).emit('chat:delivery_confirmed', payload);
}
