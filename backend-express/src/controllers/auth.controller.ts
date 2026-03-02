import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.json(result);
};

export const getMe = async (req: AuthRequest, res: Response) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        is_active: req.user.isActive
    });
};
