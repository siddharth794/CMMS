import { Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role === 'requester') {
            return res.status(403).json({ message: 'Not authorized to manage inventory' });
        }

        const { name, description, category, sku, quantity, minQuantity, unit, location, unitCost } = req.body;

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

        res.status(201).json(item);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getInventoryItems = async (req: AuthRequest, res: Response) => {
    try {
        const { category, skip = '0', limit = '100' } = req.query;

        const where: any = {};
        if (category) where.category = String(category);
        // lowStock condition handled in memory or via raw query based on quantity <= minQuantity if needed
        // Assuming simple fetch to replicate original logic

        const items = await prisma.inventoryItem.findMany({
            where,
            skip: parseInt(String(skip)),
            take: parseInt(String(limit)),
            orderBy: { createdAt: 'desc' }
        });

        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'requester') {
            return res.status(403).json({ message: 'Not authorized to manage inventory' });
        }

        const { name, description, category, quantity, minQuantity, unit, location, unitCost } = req.body;

        const existingItem = await prisma.inventoryItem.findUnique({ where: { id } });
        if (!existingItem) {
            return res.status(404).json({ message: 'Inventory item not found' });
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

            // Check if stock became low
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

        res.json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
