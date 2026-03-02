import { Prisma } from '@prisma/client';
import { prisma } from '../app';

export class PMScheduleRepository {
    static async create(data: Prisma.PMScheduleUncheckedCreateInput | Prisma.PMScheduleCreateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.pMSchedule.create({ data });
    }

    static async findMany(where: Prisma.PMScheduleWhereInput, skip: number, take: number, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.pMSchedule.findMany({
            where,
            skip,
            take,
            orderBy: { nextDueDate: 'asc' },
            include: {
                asset: { select: { name: true } },
                assignee: { select: { name: true } }
            }
        });
    }

    static async findById(id: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.pMSchedule.findUnique({
            where: { id },
            include: {
                asset: { select: { name: true } },
                assignee: { select: { name: true } }
            }
        });
    }

    static async update(id: string, data: Prisma.PMScheduleUncheckedUpdateInput | Prisma.PMScheduleUpdateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.pMSchedule.update({
            where: { id },
            data
        });
    }

    static async delete(id: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.pMSchedule.delete({
            where: { id }
        });
    }
}
