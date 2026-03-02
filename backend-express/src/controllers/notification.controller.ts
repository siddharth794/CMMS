import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { NotificationService } from '../services/notification.service';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    const notifications = await NotificationService.getNotifications(req.user.id, req.query);
    res.json(notifications);
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    const result = await NotificationService.markNotificationRead(String(req.params.id), req.user.id);
    res.json(result);
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
    const result = await NotificationService.markAllNotificationsRead(req.user.id);
    res.json(result);
};
