import { prisma } from '../app';

export class WorkOrderService {
    static async createWorkOrder(data: any, creatorId: string) {
        const { title, description, priority, assetId, location, dueDate, notes } = data;

        const [workOrder, admins] = await prisma.$transaction(async (tx: any) => {
            const wo = await tx.workOrder.create({
                data: {
                    title,
                    description,
                    priority: priority || 'medium',
                    location,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    notes,
                    creatorId,
                    assetId
                }
            });

            const adminsAndTechs = await tx.user.findMany({
                where: { role: { in: ['admin', 'technician'] }, id: { not: creatorId } },
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

        return workOrders;
    }

    static async getWorkOrderById(id: string) {
        const workOrder = await prisma.workOrder.findUnique({
            where: { id },
            include: {
                creator: { select: { name: true } },
                assignee: { select: { name: true } },
                asset: { select: { name: true } }
            }
        });

        if (!workOrder) throw new Error('Work order not found');

        return workOrder;
    }

    static async updateWorkOrder(id: string, data: any) {
        const { title, description, priority, status, assignedTo, location, dueDate, notes } = data;

        const existingWo = await prisma.workOrder.findUnique({ where: { id } });
        if (!existingWo) throw new Error('Work order not found');

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

        return updatedWo;
    }
}
