import { Prisma } from '@prisma/client';
import { prisma } from '../app';

export class UserRepository {
    static async findByEmail(email: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.user.findUnique({ where: { email } });
    }

    static async findById(id: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, role: true, isActive: true }
        });
    }

    static async create(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.user.create({ data });
    }

    static async findAdminsAndTechsExcept(userId: string, tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.user.findMany({
            where: { role: { in: ['admin', 'technician'] }, id: { not: userId } },
            select: { id: true }
        });
    }

    static async findAdmins(tx?: Prisma.TransactionClient) {
        const db = tx || prisma;
        return db.user.findMany({
            where: { role: 'admin' },
            select: { id: true }
        });
    }
}
