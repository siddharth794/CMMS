import { AssetRepository } from '../repositories/asset.repository';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { AssetStatus } from '@prisma/client';

export class AssetService {
    static async createAsset(data: any, userRole: string) {
        if (userRole === 'requester') {
            throw new ForbiddenError('Not authorized to create assets');
        }

        const { name, description, category, location, serialNumber, manufacturer, model, purchaseDate, warrantyExpiry } = data;

        return AssetRepository.create({
            name,
            description,
            category,
            location,
            serialNumber,
            manufacturer,
            model,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null
        });
    }

    static async getAssets(query: any) {
        const { status, category, skip = '0', limit = '100' } = query;

        const where: any = {};
        if (status) where.status = status as AssetStatus;
        if (category) where.category = String(category);

        return AssetRepository.findMany(where, parseInt(String(skip)), parseInt(String(limit)));
    }

    static async getAssetById(id: string) {
        const asset = await AssetRepository.findById(id);
        if (!asset) throw new NotFoundError('Asset not found');
        return asset;
    }

    static async updateAsset(id: string, data: any, userRole: string) {
        if (userRole === 'requester') {
            throw new ForbiddenError('Not authorized to update assets');
        }

        const existingAsset = await AssetRepository.findById(id);
        if (!existingAsset) throw new NotFoundError('Asset not found');

        const { name, description, category, location, status, serialNumber, manufacturer, model, purchaseDate, warrantyExpiry } = data;

        return AssetRepository.update(id, {
            name,
            description,
            category,
            location,
            status,
            serialNumber,
            manufacturer,
            model,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined
        });
    }

    static async deleteAsset(id: string, userRole: string) {
        if (userRole !== 'admin') {
            throw new ForbiddenError('Admin access required');
        }

        const existingAsset = await AssetRepository.findById(id);
        if (!existingAsset) throw new NotFoundError('Asset not found');

        await AssetRepository.delete(id);
        return { message: 'Asset deleted' };
    }
}
