import { prisma } from '../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { Chat, Message, MessageType, AppointmentStatus } from '../../../domain/types/chat.types';
import { decimalToNumber } from '../../../shared/utils/prisma-mappers';

type ChatExtras = {
  product_name?: string;
  product_price?: number;
  product_image?: string;
  last_message?: string;
  last_message_at?: Date;
};

function mapChat(
  row: {
    id: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    status: Chat['status'];
    createdAt: Date;
    updatedAt: Date;
  },
  extras?: ChatExtras
): Chat & ChatExtras {
  return {
    id: row.id,
    product_id: row.productId,
    buyer_id: row.buyerId,
    seller_id: row.sellerId,
    status: row.status,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    ...extras,
  };
}

function mapMessage(
  row: {
    id: string;
    chatId: string;
    senderId: string;
    type: MessageType;
    content: string;
    appointmentStatus: AppointmentStatus | null;
    appointmentDay: string | null;
    appointmentTime: string | null;
    appointmentLocation: string | null;
    createdAt: Date;
  }
): Message {
  return {
    id: row.id,
    chat_id: row.chatId,
    sender_id: row.senderId,
    type: row.type,
    content: row.content,
    appointment_status: row.appointmentStatus,
    appointment_day: row.appointmentDay,
    appointment_time: row.appointmentTime,
    appointment_location: row.appointmentLocation,
    created_at: row.createdAt,
  };
}

const chatInclude = {
  product: { select: { name: true, price: true, imageUrl: true } },
} as const;

function mapChatExtrasFromRow(row: {
  product: { name: string; price: Decimal; imageUrl: string };
  messages?: { content: string; createdAt: Date }[];
}): ChatExtras {
  return {
    product_name: row.product.name,
    product_price: decimalToNumber(row.product.price),
    product_image: row.product.imageUrl,
    last_message: row.messages?.[0]?.content,
    last_message_at: row.messages?.[0]?.createdAt,
  };
}

export const chatRepository = {
  async findByProductAndBuyer(productId: string, buyerId: string): Promise<Chat | null> {
    const row = await prisma.chat.findUnique({
      where: { productId_buyerId: { productId, buyerId } },
    });
    return row ? mapChat(row) : null;
  },

  async findById(id: string): Promise<(Chat & ChatExtras) | null> {
    const row = await prisma.chat.findUnique({
      where: { id },
      include: chatInclude,
    });
    if (!row) return null;

    return mapChat(row, mapChatExtrasFromRow(row));
  },

  async findByUser(userId: string): Promise<(Chat & ChatExtras)[]> {
    const rows = await prisma.chat.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        ...chatInclude,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const mapped = rows.map((row) => mapChat(row, mapChatExtrasFromRow(row)));

    return mapped.sort((a, b) => {
      const aTime = a.last_message_at?.getTime() ?? a.updated_at.getTime();
      const bTime = b.last_message_at?.getTime() ?? b.updated_at.getTime();
      return bTime - aTime;
    });
  },

  async create(productId: string, buyerId: string, sellerId: string): Promise<Chat> {
    const row = await prisma.chat.create({
      data: { productId, buyerId, sellerId },
    });
    return mapChat(row);
  },

  async confirmDelivery(id: string): Promise<void> {
    await prisma.chat.update({
      where: { id },
      data: { status: 'delivery_confirmed' },
    });
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const rows = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => mapMessage(row));
  },

  async createMessage(
    chatId: string,
    senderId: string,
    content: string,
    type: MessageType = 'text',
    appointment?: {
      day: string;
      time: string;
      location: string;
      status: AppointmentStatus;
    }
  ): Promise<Message> {
    const row = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        type,
        ...(appointment
          ? {
              appointmentStatus: appointment.status,
              appointmentDay: appointment.day,
              appointmentTime: appointment.time,
              appointmentLocation: appointment.location,
            }
          : {}),
      },
    });
    return mapMessage(row);
  },

  async findMessageById(id: string): Promise<Message | null> {
    const row = await prisma.message.findUnique({
      where: { id },
    });
    return row ? mapMessage(row) : null;
  },

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    content: string
  ): Promise<Message> {
    const row = await prisma.message.update({
      where: { id },
      data: { appointmentStatus: status, content },
    });
    return mapMessage(row);
  },
};
