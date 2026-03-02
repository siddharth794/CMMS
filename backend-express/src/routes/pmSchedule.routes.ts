import { Router } from 'express';
import { createPMSchedule, getPMSchedules, updatePMSchedule, deletePMSchedule, completePMSchedule } from '../controllers/pmSchedule.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createPMSchedule);
router.get('/', authenticate, getPMSchedules);
router.put('/:id', authenticate, updatePMSchedule);
router.delete('/:id', authenticate, deletePMSchedule);
router.post('/:id/complete', authenticate, completePMSchedule);

export default router;
