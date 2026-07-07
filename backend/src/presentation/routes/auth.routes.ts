import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login',    asyncHandler(authController.login));
router.get('/users', authMiddleware, asyncHandler(authController.getUsersByUniversity));
router.patch(
  '/change-password',
  authMiddleware,
  asyncHandler(authController.changePassword),
);

export default router;
