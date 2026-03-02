import { Router } from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset } from '../controllers/asset.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, createAsset);
router.get('/', authenticate, getAssets);
router.get('/:id', authenticate, getAssetById);
router.put('/:id', authenticate, updateAsset);
router.delete('/:id', authenticate, deleteAsset);

export default router;
