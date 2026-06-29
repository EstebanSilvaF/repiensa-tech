import { Response } from 'express';
import { chatService } from '../../application/services/chat.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createHttpError } from '../middlewares/error.middleware';
import { emitChatDeliveryConfirmed, emitChatUpdated, emitMessageNew, emitMessageUpdated } from '../../infrastructure/ws/chat.events';
import { RespondAppointmentDTO, SendMessageDTO } from '../../domain/types/chat.types';

export const chatController = {
  async getMyChats(req: AuthRequest, res: Response): Promise<void> {
    const chats = await chatService.getMyChats(req.user!.userId);
    res.json(chats);
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const chat = await chatService.getById(req.params.id as string, req.user!.userId);
    res.json(chat);
  },

  async openChat(req: AuthRequest, res: Response): Promise<void> {
    const { product_id } = req.body;
    if (!product_id) {
      throw createHttpError(400, 'product_id es requerido');
    }

    const chat = await chatService.openChat(product_id, req.user!.userId);
    res.status(201).json(chat);
  },

  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    const messages = await chatService.getMessages(req.params.id as string, req.user!.userId);
    res.json(messages);
  },

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    const body = req.body as SendMessageDTO;
    const type = body.type ?? 'text';

    if (type === 'text' && !body.content?.trim()) {
      throw createHttpError(400, 'El contenido del mensaje es requerido');
    }

    if (type === 'appointment' && !body.appointment) {
      throw createHttpError(400, 'Los datos del encuentro son requeridos');
    }

    const chatId = req.params.id as string;
    const message = await chatService.sendMessage(chatId, req.user!.userId, body);

    const chat = await chatService.getById(chatId, req.user!.userId);
    emitMessageNew(chatId, message);
    emitChatUpdated(chat.buyer_id, chat.seller_id, {
      id: chat.id,
      status: chat.status,
      last_message: message.content,
      last_message_at: message.created_at,
    });

    res.status(201).json(message);
  },

  async respondToAppointment(req: AuthRequest, res: Response): Promise<void> {
    const body = req.body as RespondAppointmentDTO;
    if (body.action !== 'accept' && body.action !== 'reject') {
      throw createHttpError(400, 'action debe ser "accept" o "reject"');
    }

    const chatId = req.params.id as string;
    const messageId = req.params.messageId as string;
    const message = await chatService.respondToAppointment(
      chatId,
      messageId,
      req.user!.userId,
      body.action
    );

    const chat = await chatService.getById(chatId, req.user!.userId);
    emitMessageUpdated(chatId, message);
    emitChatUpdated(chat.buyer_id, chat.seller_id, {
      id: chat.id,
      status: chat.status,
      last_message: message.content,
      last_message_at: message.created_at,
    });

    res.json(message);
  },

  async confirmDelivery(req: AuthRequest, res: Response): Promise<void> {
    const chatId = req.params.id as string;
    const chat = await chatService.getById(chatId, req.user!.userId);
    const result = await chatService.confirmDelivery(chatId, req.user!.userId);

    emitChatDeliveryConfirmed(chatId, chat.buyer_id, chat.seller_id);
    emitChatUpdated(chat.buyer_id, chat.seller_id, {
      id: chatId,
      status: 'delivery_confirmed',
    });

    res.json(result);
  },
};
