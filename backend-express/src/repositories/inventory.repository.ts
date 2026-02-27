import { Prisma } from '@prisma/client';
import { prisma } from '../app';

export class InventoryRepository {
    static async create(data: Prisma.InventoryItemUncheckedCreateInput | Prisma.InventoryItemCreateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.inventoryItem.create({ data });
    }

    static async findMany(where: Prisma.InventoryItemWhereInput | any, skip: number, take: number, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.inventoryItem.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        });
    }

    static async findById(id: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.inventoryItem.findUnique({ where: { id } });
    }

    static async update(id: string, data: Prisma.InventoryItemUncheckedUpdateInput | Prisma.InventoryItemUpdateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.inventoryItem.update({
            where: { id },
            data
        });
    }
}
