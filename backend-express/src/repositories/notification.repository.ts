import { Prisma } from '@prisma/client';
import { prisma } from '../app';

export class NotificationRepository {
    static async create(data: Prisma.NotificationUncheckedCreateInput | Prisma.NotificationCreateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.notification.create({ data });
    }

    static async createMany(data: Prisma.NotificationCreateManyInput[], tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.notification.createMany({ data });
    }

    static async findMany(userId: string, skip: number, take: number, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.notification.findMany({
            where: { userId },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        });
    }

    static async update(id: string, userId: string, data: Prisma.NotificationUpdateInput | Prisma.NotificationUncheckedUpdateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.notification.updateMany({
            where: { id, userId },
            data
        });
    }

    static async updateMany(userId: string, data: Prisma.NotificationUpdateManyMutationInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.notification.updateMany({
            where: { userId },
            data
        });
    }
}
