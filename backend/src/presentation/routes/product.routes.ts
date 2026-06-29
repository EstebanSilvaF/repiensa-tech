import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler';
import { handleUploadError, productImageUpload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/',        asyncHandler(productController.getAll));
router.get('/mine',    asyncHandler(productController.getMine));
router.post('/generate-description', (req, res, next) => {
  productImageUpload(req, res, (err) => {
    if (err) {
      handleUploadError(err, req, res, next);
      return;
    }
    asyncHandler(productController.generateDescription)(req, res, next);
  });
});
router.get('/:id',     asyncHandler(productController.getById));
router.post('/',       asyncHandler(productController.create));
router.delete('/:id',  asyncHandler(productController.remove));

export default router;
