import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PMScheduleService } from '../services/pmSchedule.service';

export const createPMSchedule = async (req: AuthRequest, res: Response) => {
    const pm = await PMScheduleService.createPMSchedule(req.body, req.user.role);
    res.status(201).json(pm);
};

export const getPMSchedules = async (req: AuthRequest, res: Response) => {
    const pms = await PMScheduleService.getPMSchedules(req.query);
    res.json(pms);
};

export const updatePMSchedule = async (req: AuthRequest, res: Response) => {
    const pm = await PMScheduleService.updatePMSchedule(String(req.params.id), req.body, req.user.role);
    res.json(pm);
};

export const deletePMSchedule = async (req: AuthRequest, res: Response) => {
    const result = await PMScheduleService.deletePMSchedule(String(req.params.id), req.user.role);
    res.json(result);
};

export const completePMSchedule = async (req: AuthRequest, res: Response) => {
    const result = await PMScheduleService.completePMSchedule(String(req.params.id), req.user.role);
    res.json(result);
};
