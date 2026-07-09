import { chatRepository } from '../../infrastructure/persistence/repositories/chat.repository';
import { productRepository } from '../../infrastructure/persistence/repositories/product.repository';
import { reservationRepository } from '../../infrastructure/persistence/repositories/reservation.repository';
import { transactionRepository } from '../../infrastructure/persistence/repositories/transaction.repository';
import {
  AppointmentPayload,
  AppointmentResponseAction,
  SendMessageDTO,
} from '../../domain/types/chat.types';
import {
  assertChatAccess,
  formatAcceptedContent,
  formatProposalContent,
  formatRejectedContent,
  validateAppointmentPayload,
  validateConfirmDelivery,
  validateMessageContent,
  validateOpenChat,
  validateSendMessage,
} from '../../domain/validators/chat.validator';
import { assertProductExists } from '../../domain/validators/product.validator';
import {
  enrichChatsWithParticipants,
  enrichMessagesWithSender,
} from '../helpers/user-profile.helper';

export const chatService = {
  async getMyChats(userId: string) {
    const chats = await chatRepository.findByUser(userId);
    return enrichChatsWithParticipants(chats);
  },

  async getById(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    assertChatAccess(chat, userId);
    const [enriched] = await enrichChatsWithParticipants([chat!]);
    return enriched;
  },

  async openChat(productId: string, buyerId: string) {
    const product = await productRepository.findById(productId);
    validateOpenChat(product, buyerId);

    const existing = await chatRepository.findByProductAndBuyer(productId, buyerId);
    if (existing) return existing;

    return chatRepository.create(productId, buyerId, product.seller_id);
  },

  async getMessages(chatId: string, userId: string) {
    await chatService.getById(chatId, userId);
    const messages = await chatRepository.getMessages(chatId);
    return enrichMessagesWithSender(messages);
  },

  async sendMessage(chatId: string, senderId: string, data: SendMessageDTO) {
    const chat = await chatRepository.findById(chatId);
    validateSendMessage(chat, senderId);

    const type = data.type ?? 'text';
    let content = data.content?.trim() ?? '';

    if (type === 'appointment') {
      const appointment = data.appointment as AppointmentPayload;
      validateAppointmentPayload(appointment);
      const day = appointment.day.trim();
      const time = appointment.time.trim();
      const location = appointment.location.trim();
      content = formatProposalContent({ day, time, location });

      return enrichMessagesWithSender([
        await chatRepository.createMessage(chatId, senderId, content, type, {
          day,
          time,
          location,
          status: 'pending',
        }),
      ]).then(([message]) => message);
    } else {
      validateMessageContent(content);
    }

    const [message] = await enrichMessagesWithSender([
      await chatRepository.createMessage(chatId, senderId, content, type),
    ]);
    return message;
  },

  async respondToAppointment(
    chatId: string,
    messageId: string,
    userId: string,
    action: AppointmentResponseAction
  ) {
    const chat = await chatRepository.findById(chatId);
    validateSendMessage(chat, userId);

    const existingMessage = await chatRepository.findMessageById(messageId);
    if (existingMessage?.chat_id !== chatId) {
      throw new Error('Mensaje no encontrado');
    }
    if (existingMessage.type !== 'appointment') {
      throw new Error('Este mensaje no es una propuesta de encuentro');
    }
    if (existingMessage.appointment_status !== 'pending') {
      throw new Error('Esta propuesta ya fue respondida');
    }
    if (existingMessage.sender_id === userId) {
      throw new Error('No puedes responder tu propia propuesta');
    }
    if (!existingMessage.appointment_day || !existingMessage.appointment_time || !existingMessage.appointment_location) {
      throw new Error('La propuesta no tiene datos completos');
    }

    const appointment = {
      day: existingMessage.appointment_day,
      time: existingMessage.appointment_time,
      location: existingMessage.appointment_location,
    };

    const status = action === 'accept' ? 'accepted' : 'rejected';
    const content =
      action === 'accept'
        ? formatAcceptedContent(appointment)
        : formatRejectedContent(appointment);

    const [updatedMessage] = await enrichMessagesWithSender([
      await chatRepository.updateAppointmentStatus(messageId, status, content),
    ]);
    return updatedMessage;
  },

  async confirmDelivery(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    validateConfirmDelivery(chat, userId);

    const product = await productRepository.findById(chat.product_id);
    assertProductExists(product);

    const reservation = await reservationRepository.findLatestByProductAndBuyer(
      chat.product_id,
      chat.buyer_id
    );

    await transactionRepository.completeSale({
      chatId,
      productId: chat.product_id,
      sellerId: chat.seller_id,
      buyerId: chat.buyer_id,
      finalPrice: product.price,
      reservationId: reservation?.id ?? null,
    });

    return { message: 'Entrega confirmada. Transacción registrada en el historial.' };
  },
};
