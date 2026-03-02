import { Router } from 'express';
import { createInventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem } from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createInventoryItem);
router.get('/', authenticate, getInventoryItems);
router.put('/:id', authenticate, updateInventoryItem);
router.delete('/:id', authenticate, deleteInventoryItem);

export default router;
