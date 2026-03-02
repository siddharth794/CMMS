import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import workOrderRoutes from './workOrder.routes';
import inventoryRoutes from './inventory.routes';
import assetRoutes from './asset.routes';
import pmScheduleRoutes from './pmSchedule.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/assets', assetRoutes);
router.use('/pm-schedules', pmScheduleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
