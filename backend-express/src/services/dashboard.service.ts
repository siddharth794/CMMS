import { prisma } from '../app';

export class DashboardService {
    static async getDashboardStats() {
        const total_wo = await prisma.workOrder.count();
        const open_wo = await prisma.workOrder.count({ where: { status: 'open' } });
        const in_progress_wo = await prisma.workOrder.count({ where: { status: 'in_progress' } });
        const completed_wo = await prisma.workOrder.count({ where: { status: 'completed' } });
        const critical_wo = await prisma.workOrder.count({ where: { priority: 'critical', status: { not: 'completed' } } });

        const total_assets = await prisma.asset.count();
        const operational_assets = await prisma.asset.count({ where: { status: 'operational' } });
        const maintenance_assets = await prisma.asset.count({ where: { status: 'maintenance' } });

        const total_inventory = await prisma.inventoryItem.count();
        // Prismas doesn't easily compare two columns inside count directly, so we use findMany to grab ones where quantity <= minQuantity
        // Or aggregate, but this works fine if dataset isn't huge. For scale, use a raw query
        const lowStockItems = await prisma.$queryRaw`SELECT COUNT(*) FROM "InventoryItem" WHERE quantity <= "minQuantity"`;
        const low_stock_count = Number((lowStockItems as any)[0].count);

        const total_pm = await prisma.pMSchedule.count({ where: { isActive: true } });

        const recent_wo = await prisma.workOrder.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { creator: { select: { name: true } } }
        });

        const upcoming_pm = await prisma.pMSchedule.findMany({
            where: { isActive: true },
            take: 5,
            orderBy: { nextDueDate: 'asc' },
            include: { asset: { select: { name: true } } }
        });

        return {
            work_orders: {
                total: total_wo,
                open: open_wo,
                in_progress: in_progress_wo,
                completed: completed_wo,
                critical: critical_wo
            },
            assets: {
                total: total_assets,
                operational: operational_assets,
                maintenance: maintenance_assets
            },
            inventory: {
                total: total_inventory,
                low_stock: low_stock_count
            },
            pm_schedules: {
                active: total_pm
            },
            recent_work_orders: recent_wo.map(wo => ({
                ...wo,
                created_by_name: wo.creator?.name || 'Unknown'
            })),
            upcoming_maintenance: upcoming_pm.map(pm => ({
                ...pm,
                asset_name: pm.asset?.name || 'Unknown'
            }))
        };
    }

    static async getWorkOrderReport(query: any) {
        const { start_date, end_date } = query;

        const where: any = {};
        if (start_date) {
            where.createdAt = { ...where.createdAt, gte: new Date(start_date) };
        }
        if (end_date) {
            where.createdAt = { ...where.createdAt, lte: new Date(end_date) };
        }

        const total = await prisma.workOrder.count({ where });
        const completed = await prisma.workOrder.count({ where: { ...where, status: 'completed' } });
        const completion_rate = total > 0 ? (completed / total) * 100 : 0;

        // Group by status
        const byStatusAgg = await prisma.workOrder.groupBy({
            by: ['status'],
            where,
            _count: { status: true }
        });
        const by_status = byStatusAgg.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status;
            return acc;
        }, {} as Record<string, number>);

        // Group by priority
        const byPriorityAgg = await prisma.workOrder.groupBy({
            by: ['priority'],
            where,
            _count: { priority: true }
        });
        const by_priority = byPriorityAgg.reduce((acc, curr) => {
            acc[curr.priority] = curr._count.priority;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            completed,
            completion_rate: Math.round(completion_rate * 10) / 10,
            by_status,
            by_priority
        };
    }
}
