import { Router } from 'express';
import { createInventoryItem, getInventoryItems, updateInventoryItem } from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createInventoryItem);
router.get('/', authenticate, getInventoryItems);
router.put('/:id', authenticate, updateInventoryItem);

export default router;
