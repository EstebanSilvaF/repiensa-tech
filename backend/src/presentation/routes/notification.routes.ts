import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/',              asyncHandler(notificationController.getAll));
router.patch('/read-all',    asyncHandler(notificationController.markAllRead));
router.patch('/:id/read',    asyncHandler(notificationController.markOneRead));

export default router;
