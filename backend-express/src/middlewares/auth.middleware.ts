import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const user = await UserRepository.findById(decoded.sub || decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Unauthorized: Invalid user' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }

        next();
    };
};
