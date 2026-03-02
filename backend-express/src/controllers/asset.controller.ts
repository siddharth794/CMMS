import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AssetService } from '../services/asset.service';

export const createAsset = async (req: AuthRequest, res: Response) => {
    const asset = await AssetService.createAsset(req.body, req.user.role);
    res.status(201).json(asset);
};

export const getAssets = async (req: AuthRequest, res: Response) => {
    const assets = await AssetService.getAssets(req.query);
    res.json(assets);
};

export const getAssetById = async (req: AuthRequest, res: Response) => {
    const asset = await AssetService.getAssetById(String(req.params.id));
    res.json(asset);
};

export const updateAsset = async (req: AuthRequest, res: Response) => {
    const asset = await AssetService.updateAsset(String(req.params.id), req.body, req.user.role);
    res.json(asset);
};

export const deleteAsset = async (req: AuthRequest, res: Response) => {
    const result = await AssetService.deleteAsset(String(req.params.id), req.user.role);
    res.json(result);
};
