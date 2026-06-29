import { Router } from 'express';
import { universityController } from '../controllers/university.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(universityController.getAll));

router.use(authMiddleware, adminMiddleware);
router.post('/',            asyncHandler(universityController.create));
router.patch('/:id/status', asyncHandler(universityController.updateStatus));

export default router;
