import { Router } from 'express';
import { getUsers, getTechnicians } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getUsers);
router.get('/technicians', authenticate, getTechnicians);

export default router;
