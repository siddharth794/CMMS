import { prisma } from '../app';

export class InventoryService {
    static async createInventoryItem(data: any) {
        const { name, description, category, sku, quantity, minQuantity, unit, location, unitCost } = data;

        const item = await prisma.inventoryItem.create({
            data: {
                name,
                description,
                category,
                sku,
                quantity: quantity || 0,
                minQuantity: minQuantity || 0,
                unit: unit || 'pcs',
                location,
                unitCost: unitCost || 0.0
            }
        });

        return item;
    }

    static async getInventoryItems(query: any) {
        const { category, skip = '0', limit = '100' } = query;

        const where: any = {};
        if (category) where.category = String(category);

        const items = await prisma.inventoryItem.findMany({
            where,
            skip: parseInt(String(skip)),
            take: parseInt(String(limit)),
            orderBy: { createdAt: 'desc' }
        });

        return items;
    }

    static async updateInventoryItem(id: string, data: any) {
        const { name, description, category, quantity, minQuantity, unit, location, unitCost } = data;

        const existingItem = await prisma.inventoryItem.findUnique({ where: { id } });
        if (!existingItem) {
            throw new Error('Inventory item not found');
        }

        const [updatedItem] = await prisma.$transaction(async (tx: any) => {
            const item = await tx.inventoryItem.update({
                where: { id },
                data: {
                    name,
                    description,
                    category,
                    quantity,
                    minQuantity,
                    unit,
                    location,
                    unitCost
                }
            });

            if (item.quantity <= item.minQuantity) {
                const admins = await tx.user.findMany({
                    where: { role: 'admin' },
                    select: { id: true }
                });

                if (admins.length > 0) {
                    await tx.notification.createMany({
                        data: admins.map((admin: any) => ({
                            userId: admin.id,
                            type: 'inventory',
                            title: 'Low Stock Alert',
                            message: `Item '${item.name}' is running low (${item.quantity} remaining)`,
                            referenceId: item.id
                        }))
                    });
                }
            }

            return [item];
        });

        return updatedItem;
    }
}
