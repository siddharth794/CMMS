import { prisma } from '../app';
import { InventoryRepository } from '../repositories/inventory.repository';
import { UserRepository } from '../repositories/user.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotFoundError } from '../utils/AppError';

export class InventoryService {
    static async createInventoryItem(data: any) {
        const { name, description, category, sku, quantity, minQuantity, unit, location, unitCost } = data;

        return InventoryRepository.create({
            name,
            description,
            category,
            sku,
            quantity: quantity || 0,
            minQuantity: minQuantity || 0,
            unit: unit || 'pcs',
            location,
            unitCost: unitCost || 0.0
        });
    }

    static async getInventoryItems(query: any) {
        const { category, skip = '0', limit = '100' } = query;

        const where: any = {};
        if (category) where.category = String(category);

        return InventoryRepository.findMany(where, parseInt(String(skip)), parseInt(String(limit)));
    }

    static async updateInventoryItem(id: string, data: any) {
        const { name, description, category, quantity, minQuantity, unit, location, unitCost } = data;

        const existingItem = await InventoryRepository.findById(id);
        if (!existingItem) {
            throw new NotFoundError('Inventory item not found');
        }

        const [updatedItem] = await prisma.$transaction(async (tx: any) => {
            const item = await InventoryRepository.update(id, {
                name,
                description,
                category,
                quantity,
                minQuantity,
                unit,
                location,
                unitCost
            }, tx);

            if (item.quantity <= item.minQuantity) {
                const admins = await UserRepository.findAdmins(tx);

                if (admins.length > 0) {
                    await NotificationRepository.createMany(
                        admins.map((admin: any) => ({
                            userId: admin.id,
                            type: 'inventory',
                            title: 'Low Stock Alert',
                            message: `Item '${item.name}' is running low (${item.quantity} remaining)`,
                            referenceId: item.id
                        })),
                        tx
                    );
                }
            }

            return [item];
        });

        return updatedItem;
    }
}
