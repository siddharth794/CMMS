import { Router } from 'express';
import { createWorkOrder, getWorkOrders, getWorkOrderById, updateWorkOrder, deleteWorkOrder } from '../controllers/workOrder.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createWorkOrder);
router.get('/', authenticate, getWorkOrders);
router.get('/:id', authenticate, getWorkOrderById);
router.put('/:id', authenticate, updateWorkOrder);
router.delete('/:id', authenticate, deleteWorkOrder);

export default router;
