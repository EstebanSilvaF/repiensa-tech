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

export const chatService = {
  async getMyChats(userId: string) {
    return chatRepository.findByUser(userId);
  },

  async getById(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    assertChatAccess(chat, userId);
    return chat;
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
    return chatRepository.getMessages(chatId);
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

      return chatRepository.createMessage(chatId, senderId, content, type, {
        day,
        time,
        location,
        status: 'pending',
      });
    } else {
      validateMessageContent(content);
    }

    return chatRepository.createMessage(chatId, senderId, content, type);
  },

  async respondToAppointment(
    chatId: string,
    messageId: string,
    userId: string,
    action: AppointmentResponseAction
  ) {
    const chat = await chatRepository.findById(chatId);
    validateSendMessage(chat, userId);

    const message = await chatRepository.findMessageById(messageId);
    if (!message || message.chat_id !== chatId) {
      throw new Error('Mensaje no encontrado');
    }
    if (message.type !== 'appointment') {
      throw new Error('Este mensaje no es una propuesta de encuentro');
    }
    if (message.appointment_status !== 'pending') {
      throw new Error('Esta propuesta ya fue respondida');
    }
    if (message.sender_id === userId) {
      throw new Error('No puedes responder tu propia propuesta');
    }
    if (!message.appointment_day || !message.appointment_time || !message.appointment_location) {
      throw new Error('La propuesta no tiene datos completos');
    }

    const appointment = {
      day: message.appointment_day,
      time: message.appointment_time,
      location: message.appointment_location,
    };

    const status = action === 'accept' ? 'accepted' : 'rejected';
    const content =
      action === 'accept'
        ? formatAcceptedContent(appointment)
        : formatRejectedContent(appointment);

    return chatRepository.updateAppointmentStatus(messageId, status, content);
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
