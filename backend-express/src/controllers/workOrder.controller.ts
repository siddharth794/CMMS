import { Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createWorkOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority, assetId, location, dueDate, notes } = req.body;

        const [workOrder, admins] = await prisma.$transaction(async (tx: any) => {
            const wo = await tx.workOrder.create({
                data: {
                    title,
                    description,
                    priority: priority || 'medium',
                    location,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    notes,
                    creatorId: req.user.id,
                    assetId
                }
            });

            const adminsAndTechs = await tx.user.findMany({
                where: { role: { in: ['admin', 'technician'] }, id: { not: req.user.id } },
                select: { id: true }
            });

            if (adminsAndTechs.length > 0) {
                await tx.notification.createMany({
                    data: adminsAndTechs.map((admin: any) => ({
                        userId: admin.id,
                        type: 'work_order',
                        title: 'New Work Order',
                        message: `Work order '${wo.title}' has been created`,
                        referenceId: wo.id
                    }))
                });
            }

            return [wo, adminsAndTechs];
        });

        res.status(201).json(workOrder);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getWorkOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { status, priority, assignedTo, skip = '0', limit = '100' } = req.query;

        const where: any = {};

        if (req.user.role === 'requester') {
            where.creatorId = req.user.id;
        } else if (assignedTo) {
            where.assigneeId = String(assignedTo);
        }

        if (status) where.status = String(status);
        if (priority) where.priority = String(priority);

        const workOrders = await prisma.workOrder.findMany({
            where,
            skip: parseInt(String(skip)),
            take: parseInt(String(limit)),
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: { name: true } },
                assignee: { select: { name: true } },
                asset: { select: { name: true } }
            }
        });

        res.json(workOrders);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getWorkOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const workOrder = await prisma.workOrder.findUnique({
            where: { id },
            include: {
                creator: { select: { name: true } },
                assignee: { select: { name: true } },
                asset: { select: { name: true } }
            }
        });

        if (!workOrder) return res.status(404).json({ message: 'Work order not found' });

        res.json(workOrder);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateWorkOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'requester') {
            return res.status(403).json({ message: 'Not authorized to update work orders' });
        }

        const { title, description, priority, status, assignedTo, location, dueDate, notes } = req.body;

        const existingWo = await prisma.workOrder.findUnique({ where: { id } });
        if (!existingWo) return res.status(404).json({ message: 'Work order not found' });

        const [updatedWo] = await prisma.$transaction(async (tx: any) => {
            const wo = await tx.workOrder.update({
                where: { id },
                data: {
                    title,
                    description,
                    priority,
                    status,
                    assigneeId: assignedTo,
                    location,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    notes,
                    ...(status === 'completed' && { completedAt: new Date() })
                }
            });

            const notifications = [];
            if (assignedTo && assignedTo !== existingWo.assigneeId) {
                notifications.push({
                    userId: assignedTo,
                    type: 'work_order' as const,
                    title: 'Work Order Assigned',
                    message: `Work order '${wo.title}' has been assigned to you`,
                    referenceId: wo.id
                });
            }

            if (status && status !== existingWo.status) {
                notifications.push({
                    userId: existingWo.creatorId,
                    type: 'work_order' as const,
                    title: 'Work Order Updated',
                    message: `Work order '${wo.title}' status changed to ${status}`,
                    referenceId: wo.id
                });
            }

            if (notifications.length > 0) {
                await tx.notification.createMany({ data: notifications });
            }

            return [wo];
        });

        res.json(updatedWo);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
