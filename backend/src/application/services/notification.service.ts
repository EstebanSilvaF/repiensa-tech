import { notificationRepository } from '../../infrastructure/persistence/repositories/notification.repository';

export const notificationService = {
  async getAll(userId: string) {
    const [notifications, unread] = await Promise.all([
      notificationRepository.findByUser(userId),
      notificationRepository.countUnread(userId),
    ]);
    return { notifications, unread };
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
  },

  async markOneRead(id: string, userId: string) {
    await notificationRepository.markOneRead(id, userId);
  },
};
