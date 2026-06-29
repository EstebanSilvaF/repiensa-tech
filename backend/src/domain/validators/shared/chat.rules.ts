import { Chat } from '../../types/chat.types';
import { ValidationRule } from '../../../shared/validation/validator';

export function chatExistsRule<T extends { chat: Chat | null }>(): ValidationRule<T> {
  return {
    test: ({ chat }) => chat !== null,
    message: 'Chat no encontrado',
  };
}

export function chatParticipantRule<T extends { chat: Chat | null }>(
  getUserId: (ctx: T) => string
): ValidationRule<T> {
  return {
    test: (ctx) => {
      const chat = ctx.chat;
      const userId = getUserId(ctx);
      return chat !== null && (chat.buyer_id === userId || chat.seller_id === userId);
    },
    message: 'No tienes acceso a este chat',
  };
}
