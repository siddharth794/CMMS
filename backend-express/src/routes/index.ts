import { Router } from 'express';
import authRoutes from './auth.routes';
import workOrderRoutes from './workOrder.routes';
import inventoryRoutes from './inventory.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
