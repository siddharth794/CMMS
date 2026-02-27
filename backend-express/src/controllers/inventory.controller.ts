import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { InventoryService } from '../services/inventory.service';

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role === 'requester') {
            return res.status(403).json({ message: 'Not authorized to manage inventory' });
        }

        const item = await InventoryService.createInventoryItem(req.body);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getInventoryItems = async (req: AuthRequest, res: Response) => {
    try {
        const items = await InventoryService.getInventoryItems(req.query);
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

        const updatedItem = await InventoryService.updateInventoryItem(String(id), req.body);
        res.json(updatedItem);
    } catch (error: any) {
        if (error.message === 'Inventory item not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
