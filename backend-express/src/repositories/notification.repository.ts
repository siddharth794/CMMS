import { Prisma } from '@prisma/client';
import { prisma } from '../app';

export class NotificationRepository {
    static async createMany(data: Prisma.NotificationCreateManyInput[], tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.notification.createMany({ data });
    }
}
