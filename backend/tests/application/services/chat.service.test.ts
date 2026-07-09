import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  findByUser,
  findById,
  findByProductAndBuyer,
  create,
  getMessages,
  createMessage,
  findMessageById,
  updateAppointmentStatus,
} = vi.hoisted(() => ({
  findByUser: vi.fn(),
  findById: vi.fn(),
  findByProductAndBuyer: vi.fn(),
  create: vi.fn(),
  getMessages: vi.fn(),
  createMessage: vi.fn(),
  findMessageById: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}));

const { findProductById } = vi.hoisted(() => ({
  findProductById: vi.fn(),
}));

const { findLatestByProductAndBuyer } = vi.hoisted(() => ({
  findLatestByProductAndBuyer: vi.fn(),
}));

const { completeSale } = vi.hoisted(() => ({
  completeSale: vi.fn(),
}));

vi.mock('../../../src/infrastructure/persistence/repositories/chat.repository', () => ({
  chatRepository: {
    findByUser,
    findById,
    findByProductAndBuyer,
    create,
    getMessages,
    createMessage,
    findMessageById,
    updateAppointmentStatus,
  },
}));

vi.mock('../../../src/infrastructure/persistence/repositories/product.repository', () => ({
  productRepository: { findById: findProductById },
}));

vi.mock('../../../src/infrastructure/persistence/repositories/reservation.repository', () => ({
  reservationRepository: { findLatestByProductAndBuyer },
}));

vi.mock('../../../src/infrastructure/persistence/repositories/transaction.repository', () => ({
  transactionRepository: { completeSale },
}));

vi.mock('../../../src/application/helpers/user-profile.helper', () => ({
  enrichChatsWithParticipants: vi.fn(async (chats: unknown[]) => chats),
  enrichMessagesWithSender: vi.fn(async (messages: unknown[]) => messages),
}));

import { chatService } from '../../../src/application/services/chat.service';

const now = new Date();

const chat = {
  id: 'chat-1',
  product_id: 'prod-1',
  buyer_id: 'buyer-1',
  seller_id: 'seller-1',
  status: 'open' as const,
  created_at: now,
  updated_at: now,
};

const product = {
  id: 'prod-1',
  seller_id: 'seller-1',
  university_id: 'uni-1',
  name: 'Arduino',
  description: null,
  price: 30000,
  is_donation: false,
  category: 'microcontrollers' as const,
  condition: 'good' as const,
  status: 'available' as const,
  image_url: null,
  image_public_id: null,
  created_at: now,
  updated_at: now,
};

describe('chat.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('openChat devuelve chat existente si ya hay uno', async () => {
    findProductById.mockResolvedValue(product);
    findByProductAndBuyer.mockResolvedValue(chat);

    const result = await chatService.openChat('prod-1', 'buyer-1');

    expect(result).toBe(chat);
    expect(create).not.toHaveBeenCalled();
  });

  it('openChat crea chat nuevo cuando no existe', async () => {
    const created = { ...chat, id: 'chat-new' };
    findProductById.mockResolvedValue(product);
    findByProductAndBuyer.mockResolvedValue(null);
    create.mockResolvedValue(created);

    const result = await chatService.openChat('prod-1', 'buyer-1');

    expect(create).toHaveBeenCalledWith('prod-1', 'buyer-1', 'seller-1');
    expect(result).toEqual(created);
  });

  it('getMyChats devuelve chats enriquecidos', async () => {
    findByUser.mockResolvedValue([chat]);

    const result = await chatService.getMyChats('buyer-1');

    expect(findByUser).toHaveBeenCalledWith('buyer-1');
    expect(result).toEqual([chat]);
  });

  it('getById valida acceso y devuelve el chat', async () => {
    findById.mockResolvedValue(chat);

    const result = await chatService.getById('chat-1', 'buyer-1');

    expect(result).toEqual(chat);
  });

  it('getMessages devuelve mensajes del chat', async () => {
    const message = {
      id: 'msg-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      content: 'Hola',
      type: 'text' as const,
      created_at: now,
    };

    findById.mockResolvedValue(chat);
    getMessages.mockResolvedValue([message]);

    const result = await chatService.getMessages('chat-1', 'buyer-1');

    expect(getMessages).toHaveBeenCalledWith('chat-1');
    expect(result).toEqual([message]);
  });

  it('sendMessage guarda mensaje de texto', async () => {
    const message = {
      id: 'msg-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      content: 'Hola',
      type: 'text' as const,
      created_at: now,
    };

    findById.mockResolvedValue(chat);
    createMessage.mockResolvedValue(message);

    const result = await chatService.sendMessage('chat-1', 'buyer-1', {
      content: 'Hola',
    });

    expect(createMessage).toHaveBeenCalledWith('chat-1', 'buyer-1', 'Hola', 'text');
    expect(result).toEqual(message);
  });

  it('sendMessage guarda propuesta de encuentro', async () => {
    const appointmentMessage = {
      id: 'msg-apt-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      content: 'Propuesta de encuentro',
      type: 'appointment' as const,
      created_at: now,
    };

    findById.mockResolvedValue(chat);
    createMessage.mockResolvedValue(appointmentMessage);

    const result = await chatService.sendMessage('chat-1', 'buyer-1', {
      type: 'appointment',
      appointment: {
        day: 'Lunes',
        time: '10:00',
        location: 'Biblioteca',
      },
    });

    expect(createMessage).toHaveBeenCalledWith(
      'chat-1',
      'buyer-1',
      expect.stringContaining('Biblioteca'),
      'appointment',
      expect.objectContaining({ status: 'pending' }),
    );
    expect(result).toEqual(appointmentMessage);
  });

  it('respondToAppointment acepta propuesta pendiente', async () => {
    const pendingMessage = {
      id: 'msg-apt-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      content: 'Propuesta',
      type: 'appointment' as const,
      appointment_status: 'pending' as const,
      appointment_day: 'Lunes',
      appointment_time: '10:00',
      appointment_location: 'Biblioteca',
      created_at: now,
    };
    const updatedMessage = {
      ...pendingMessage,
      appointment_status: 'accepted' as const,
      content: 'Aceptado',
    };

    findById.mockResolvedValue(chat);
    findMessageById.mockResolvedValue(pendingMessage);
    updateAppointmentStatus.mockResolvedValue(updatedMessage);

    const result = await chatService.respondToAppointment(
      'chat-1',
      'msg-apt-1',
      'seller-1',
      'accept',
    );

    expect(updateAppointmentStatus).toHaveBeenCalled();
    expect(result).toEqual(updatedMessage);
  });

  it('respondToAppointment rechaza responder la propia propuesta', async () => {
    findById.mockResolvedValue(chat);
    findMessageById.mockResolvedValue({
      id: 'msg-apt-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      type: 'appointment',
      appointment_status: 'pending',
      appointment_day: 'Lunes',
      appointment_time: '10:00',
      appointment_location: 'Biblioteca',
      created_at: now,
    });

    await expect(
      chatService.respondToAppointment('chat-1', 'msg-apt-1', 'buyer-1', 'accept'),
    ).rejects.toThrow('No puedes responder tu propia propuesta');
  });

  it('respondToAppointment rechaza propuesta pendiente', async () => {
    const pendingMessage = {
      id: 'msg-apt-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      content: 'Propuesta',
      type: 'appointment' as const,
      appointment_status: 'pending' as const,
      appointment_day: 'Lunes',
      appointment_time: '10:00',
      appointment_location: 'Biblioteca',
      created_at: now,
    };
    const updatedMessage = {
      ...pendingMessage,
      appointment_status: 'rejected' as const,
      content: 'Rechazado',
    };

    findById.mockResolvedValue(chat);
    findMessageById.mockResolvedValue(pendingMessage);
    updateAppointmentStatus.mockResolvedValue(updatedMessage);

    const result = await chatService.respondToAppointment(
      'chat-1',
      'msg-apt-1',
      'seller-1',
      'reject',
    );

    expect(result).toEqual(updatedMessage);
  });

  it('respondToAppointment rechaza mensajes que no son propuestas', async () => {
    findById.mockResolvedValue(chat);
    findMessageById.mockResolvedValue({
      id: 'msg-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      type: 'text',
      created_at: now,
    });

    await expect(
      chatService.respondToAppointment('chat-1', 'msg-1', 'seller-1', 'accept'),
    ).rejects.toThrow('Este mensaje no es una propuesta de encuentro');
  });

  it('respondToAppointment rechaza mensajes de otro chat', async () => {
    findById.mockResolvedValue(chat);
    findMessageById.mockResolvedValue({
      id: 'msg-apt-1',
      chat_id: 'chat-2',
      sender_id: 'buyer-1',
      type: 'appointment',
      appointment_status: 'pending',
      appointment_day: 'Lunes',
      appointment_time: '10:00',
      appointment_location: 'Biblioteca',
      created_at: now,
    });

    await expect(
      chatService.respondToAppointment('chat-1', 'msg-apt-1', 'seller-1', 'accept'),
    ).rejects.toThrow('Mensaje no encontrado');
  });

  it('respondToAppointment rechaza propuestas ya respondidas', async () => {
    findById.mockResolvedValue(chat);
    findMessageById.mockResolvedValue({
      id: 'msg-apt-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      type: 'appointment',
      appointment_status: 'accepted',
      appointment_day: 'Lunes',
      appointment_time: '10:00',
      appointment_location: 'Biblioteca',
      created_at: now,
    });

    await expect(
      chatService.respondToAppointment('chat-1', 'msg-apt-1', 'seller-1', 'accept'),
    ).rejects.toThrow('Esta propuesta ya fue respondida');
  });

  it('respondToAppointment rechaza propuestas incompletas', async () => {
    findById.mockResolvedValue(chat);
    findMessageById.mockResolvedValue({
      id: 'msg-apt-1',
      chat_id: 'chat-1',
      sender_id: 'buyer-1',
      type: 'appointment',
      appointment_status: 'pending',
      appointment_day: 'Lunes',
      appointment_time: '10:00',
      appointment_location: null,
      created_at: now,
    });

    await expect(
      chatService.respondToAppointment('chat-1', 'msg-apt-1', 'seller-1', 'accept'),
    ).rejects.toThrow('La propuesta no tiene datos completos');
  });

  it('confirmDelivery registra la venta', async () => {
    findById.mockResolvedValue(chat);
    findProductById.mockResolvedValue(product);
    findLatestByProductAndBuyer.mockResolvedValue({ id: 'res-1' });
    completeSale.mockResolvedValue(undefined);

    const result = await chatService.confirmDelivery('chat-1', 'seller-1');

    expect(completeSale).toHaveBeenCalledWith({
      chatId: 'chat-1',
      productId: 'prod-1',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
      finalPrice: 30000,
      reservationId: 'res-1',
    });
    expect(result.message).toContain('Entrega confirmada');
  });
});
