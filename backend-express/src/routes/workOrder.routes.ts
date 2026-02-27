import { Router } from 'express';
import { createWorkOrder, getWorkOrders, getWorkOrderById, updateWorkOrder } from '../controllers/workOrder.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createWorkOrder);
router.get('/', authenticate, getWorkOrders);
router.get('/:id', authenticate, getWorkOrderById);
router.put('/:id', authenticate, updateWorkOrder);

export default router;
