import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        if (error.message === 'Email already registered') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
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
