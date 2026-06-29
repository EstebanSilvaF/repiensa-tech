import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/',                       asyncHandler(chatController.getMyChats));
router.get('/:id',                    asyncHandler(chatController.getById));
router.post('/',                      asyncHandler(chatController.openChat));
router.get('/:id/messages',           asyncHandler(chatController.getMessages));
router.post('/:id/messages',          asyncHandler(chatController.sendMessage));
router.patch('/:id/messages/:messageId/appointment', asyncHandler(chatController.respondToAppointment));
router.patch('/:id/confirm-delivery', asyncHandler(chatController.confirmDelivery));

export default router;
