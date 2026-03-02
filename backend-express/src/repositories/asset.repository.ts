import { Prisma } from '@prisma/client';
import { prisma } from '../app';

export class AssetRepository {
    static async create(data: Prisma.AssetCreateInput | Prisma.AssetUncheckedCreateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.asset.create({ data });
    }

    static async findMany(where: Prisma.AssetWhereInput, skip: number, take: number, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.asset.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        });
    }

    static async findById(id: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.asset.findUnique({
            where: { id },
            include: {
                workOrders: {
                    orderBy: { createdAt: 'desc' },
                    take: 100
                },
                pmSchedules: {
                    take: 100
                }
            }
        });
    }

    static async update(id: string, data: Prisma.AssetUpdateInput | Prisma.AssetUncheckedUpdateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.asset.update({
            where: { id },
            data
        });
    }

    static async delete(id: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.asset.delete({
            where: { id }
        });
    }
}
