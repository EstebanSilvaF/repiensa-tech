import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/',  asyncHandler(reservationController.getMine));
router.post('/', asyncHandler(reservationController.reserve));

export default router;
