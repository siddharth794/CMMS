import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { InventoryService } from '../services/inventory.service';
import { ForbiddenError } from '../utils/AppError';

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
    if (req.user.role === 'requester') {
        throw new ForbiddenError('Not authorized to manage inventory');
    }

    const item = await InventoryService.createInventoryItem(req.body);
    res.status(201).json(item);
};

export const getInventoryItems = async (req: AuthRequest, res: Response) => {
    const items = await InventoryService.getInventoryItems(req.query);
    res.json(items);
};

export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (req.user.role === 'requester') {
        throw new ForbiddenError('Not authorized to manage inventory');
    }

    const updatedItem = await InventoryService.updateInventoryItem(String(id), req.body);
    res.json(updatedItem);
};
