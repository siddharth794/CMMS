import { PMScheduleRepository } from '../repositories/pmSchedule.repository';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { MaintenanceFrequency } from '@prisma/client';

export class PMScheduleService {
    static async createPMSchedule(data: any, userRole: string) {
        if (userRole === 'requester') {
            throw new ForbiddenError('Not authorized to create PM schedules');
        }

        const { title, description, assetId, frequency, nextDueDate, assignedTo, checklist } = data;

        return PMScheduleRepository.create({
            title,
            description,
            assetId,
            frequency: frequency as MaintenanceFrequency,
            nextDueDate: new Date(nextDueDate),
            assigneeId: assignedTo,
            checklist: checklist || []
        });
    }

    static async getPMSchedules(query: any) {
        const { skip = '0', limit = '100' } = query;

        return PMScheduleRepository.findMany({}, parseInt(String(skip)), parseInt(String(limit)));
    }

    static async updatePMSchedule(id: string, data: any, userRole: string) {
        if (userRole === 'requester') {
            throw new ForbiddenError('Not authorized to update PM schedules');
        }

        const existingPM = await PMScheduleRepository.findById(id);
        if (!existingPM) throw new NotFoundError('PM schedule not found');

        const { title, description, frequency, nextDueDate, assignedTo, isActive, checklist } = data;

        return PMScheduleRepository.update(id, {
            title,
            description,
            frequency: frequency as MaintenanceFrequency | undefined,
            nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
            assigneeId: assignedTo,
            isActive,
            checklist
        });
    }

    static async deletePMSchedule(id: string, userRole: string) {
        if (userRole !== 'admin') {
            throw new ForbiddenError('Admin access required');
        }

        const existingPM = await PMScheduleRepository.findById(id);
        if (!existingPM) throw new NotFoundError('PM schedule not found');

        await PMScheduleRepository.delete(id);
        return { message: 'PM schedule deleted' };
    }

    static async completePMSchedule(id: string, userRole: string) {
        if (userRole === 'requester') {
            throw new ForbiddenError('Not authorized to complete PM schedules');
        }

        const existingPM = await PMScheduleRepository.findById(id);
        if (!existingPM) throw new NotFoundError('PM schedule not found');

        const currentDueDate = new Date(existingPM.nextDueDate);
        let nextDueDate = new Date(currentDueDate);

        switch (existingPM.frequency) {
            case MaintenanceFrequency.daily:
                nextDueDate.setDate(nextDueDate.getDate() + 1);
                break;
            case MaintenanceFrequency.weekly:
                nextDueDate.setDate(nextDueDate.getDate() + 7);
                break;
            case MaintenanceFrequency.biweekly:
                nextDueDate.setDate(nextDueDate.getDate() + 14);
                break;
            case MaintenanceFrequency.monthly:
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                break;
            case MaintenanceFrequency.quarterly:
                nextDueDate.setMonth(nextDueDate.getMonth() + 3);
                break;
            case MaintenanceFrequency.yearly:
                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                break;
            default:
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        return PMScheduleRepository.update(id, {
            lastCompleted: new Date(),
            nextDueDate
        });
    }
}
