import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DashboardService } from '../services/dashboard.service';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    const stats = await DashboardService.getDashboardStats();
    res.json(stats);
};

export const getWorkOrderReport = async (req: AuthRequest, res: Response) => {
    const report = await DashboardService.getWorkOrderReport(req.query);
    res.json(report);
};
