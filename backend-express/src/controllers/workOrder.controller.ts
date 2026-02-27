import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { WorkOrderService } from '../services/workOrder.service';

export const createWorkOrder = async (req: AuthRequest, res: Response) => {
    try {
        const workOrder = await WorkOrderService.createWorkOrder(req.body, req.user.id);
        res.status(201).json(workOrder);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getWorkOrders = async (req: AuthRequest, res: Response) => {
    try {
        const workOrders = await WorkOrderService.getWorkOrders(req.query, req.user.role, req.user.id);
        res.json(workOrders);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getWorkOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const workOrder = await WorkOrderService.getWorkOrderById(String(req.params.id));
        res.json(workOrder);
    } catch (error: any) {
        if (error.message === 'Work order not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateWorkOrder = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role === 'requester') {
            return res.status(403).json({ message: 'Not authorized to update work orders' });
        }

        const updatedWo = await WorkOrderService.updateWorkOrder(String(req.params.id), req.body);
        res.json(updatedWo);
    } catch (error: any) {
        if (error.message === 'Work order not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
