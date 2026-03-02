import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { WorkOrderService } from '../services/workOrder.service';
import { ForbiddenError } from '../utils/AppError';

export const createWorkOrder = async (req: AuthRequest, res: Response) => {
    const workOrder = await WorkOrderService.createWorkOrder(req.body, req.user.id);
    res.status(201).json(workOrder);
};

export const getWorkOrders = async (req: AuthRequest, res: Response) => {
    const workOrders = await WorkOrderService.getWorkOrders(req.query, req.user.role, req.user.id);
    res.json(workOrders);
};

export const getWorkOrderById = async (req: AuthRequest, res: Response) => {
    const workOrder = await WorkOrderService.getWorkOrderById(String(req.params.id));
    res.json(workOrder);
};

export const updateWorkOrder = async (req: AuthRequest, res: Response) => {
    if (req.user.role === 'requester') {
        throw new ForbiddenError('Not authorized to update work orders');
    }

    const updatedWo = await WorkOrderService.updateWorkOrder(String(req.params.id), req.body);
    res.json(updatedWo);
};
