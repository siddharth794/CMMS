import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationService {
    static async getNotifications(userId: string, query: any) {
        const { skip = '0', limit = '100' } = query;
        return NotificationRepository.findMany(userId, parseInt(String(skip)), parseInt(String(limit)));
    }

    static async markNotificationRead(id: string, userId: string) {
        await NotificationRepository.update(id, userId, { isRead: true });
        return { message: 'Notification marked as read' };
    }

    static async markAllNotificationsRead(userId: string) {
        await NotificationRepository.updateMany(userId, { isRead: true });
        return { message: 'All notifications marked as read' };
    }
}
