import { Router } from 'express';
import { pingController } from '../controllers/ping.controller';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(pingController.ping));

export default router;
