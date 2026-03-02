import { Prisma } from '@prisma/client';
import { prisma } from '../app';

export class WorkOrderRepository {
    static async create(data: Prisma.WorkOrderUncheckedCreateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.workOrder.create({ data });
    }

    static async findMany(where: Prisma.WorkOrderWhereInput, skip: number, take: number, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.workOrder.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: { name: true } },
                assignee: { select: { name: true } },
                asset: { select: { name: true } }
            }
        });
    }

    static async findById(id: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.workOrder.findUnique({
            where: { id },
            include: {
                creator: { select: { name: true } },
                assignee: { select: { name: true } },
                asset: { select: { name: true } }
            }
        });
    }

    static async update(id: string, data: Prisma.WorkOrderUncheckedUpdateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.workOrder.update({
            where: { id },
            data
        });
    }
}
