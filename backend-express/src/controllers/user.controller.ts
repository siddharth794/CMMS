import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserService } from '../services/user.service';
import { ForbiddenError } from '../utils/AppError';

export const getUsers = async (req: AuthRequest, res: Response) => {
    if (req.user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
    }
    const users = await UserService.getUsers(req.query);
    res.json(users);
};

export const getTechnicians = async (req: AuthRequest, res: Response) => {
    const technicians = await UserService.getTechnicians(req.query);
    res.json(technicians);
};
