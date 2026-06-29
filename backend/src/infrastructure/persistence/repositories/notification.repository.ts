import { prisma } from '../prisma';
import { Notification } from '../../../domain/types/shared.types';

function mapNotification(row: {
  id: string;
  userId: string;
  type: Notification['type'];
  title: string;
  description: string | null;
  isRead: boolean;
  referenceId: string | null;
  referenceType: Notification['reference_type'];
  createdAt: Date;
}): Notification {
  return {
    id: row.id,
    user_id: row.userId,
    type: row.type,
    title: row.title,
    description: row.description,
    is_read: row.isRead,
    reference_id: row.referenceId,
    reference_type: row.referenceType,
    created_at: row.createdAt,
  };
}

export const notificationRepository = {
  async findByUser(userId: string): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map(mapNotification);
  },

  async markAllRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  },

  async markOneRead(id: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },
};
