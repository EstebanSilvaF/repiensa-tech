import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';
import { handleUploadError, productImageUpload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/product-image', (req, res, next) => {
  productImageUpload(req, res, (err) => {
    if (err) {
      handleUploadError(err, req, res, next);
      return;
    }
    asyncHandler(uploadController.uploadProductImage)(req, res, next);
  });
});

export default router;
