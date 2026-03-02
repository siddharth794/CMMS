import { prisma } from '../app';
import { WorkOrderRepository } from '../repositories/workOrder.repository';
import { UserRepository } from '../repositories/user.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotFoundError } from '../utils/AppError';

export class WorkOrderService {
    static async createWorkOrder(data: any, creatorId: string) {
        const { title, description, priority, assetId, location, dueDate, notes } = data;

        const [workOrder, admins] = await prisma.$transaction(async (tx: any) => {
            const wo = await WorkOrderRepository.create({
                title,
                description,
                priority: priority || 'medium',
                location,
                dueDate: dueDate ? new Date(dueDate) : null,
                notes,
                creatorId,
                assetId
            }, tx);

            const adminsAndTechs = await UserRepository.findAdminsAndTechsExcept(creatorId, tx);

            if (adminsAndTechs.length > 0) {
                await NotificationRepository.createMany(
                    adminsAndTechs.map((admin: any) => ({
                        userId: admin.id,
                        type: 'work_order',
                        title: 'New Work Order',
                        message: `Work order '${wo.title}' has been created`,
                        referenceId: wo.id
                    })),
                    tx
                );
            }

            return [wo, adminsAndTechs];
        });

        return workOrder;
    }

    static async getWorkOrders(query: any, userRole: string, userId: string) {
        const { status, priority, assignedTo, skip = '0', limit = '100' } = query;

        const where: any = {};

        if (userRole === 'requester') {
            where.creatorId = userId;
        } else if (assignedTo) {
            where.assigneeId = String(assignedTo);
        }

        if (status) where.status = String(status);
        if (priority) where.priority = String(priority);

        return WorkOrderRepository.findMany(where, parseInt(String(skip)), parseInt(String(limit)));
    }

    static async getWorkOrderById(id: string) {
        const workOrder = await WorkOrderRepository.findById(id);
        if (!workOrder) throw new NotFoundError('Work order not found');
        return workOrder;
    }

    static async updateWorkOrder(id: string, data: any) {
        const { title, description, priority, status, assignedTo, location, dueDate, notes } = data;

        const existingWo = await WorkOrderRepository.findById(id);
        if (!existingWo) throw new NotFoundError('Work order not found');

        const [updatedWo] = await prisma.$transaction(async (tx: any) => {
            const wo = await WorkOrderRepository.update(id, {
                title,
                description,
                priority,
                status,
                assigneeId: assignedTo,
                location,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                notes,
                ...(status === 'completed' && { completedAt: new Date() })
            }, tx);

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
                await NotificationRepository.createMany(notifications, tx);
            }

            return [wo];
        });

        return updatedWo;
    }
}
