import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Formato no permitido. Usa JPG, PNG, WEBP o GIF.'));
  },
});

export const productImageUpload = upload.single('image');

export function handleUploadError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!err) {
    next();
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'La imagen no puede superar 5 MB' });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(400).json({ message: err.message });
    return;
  }

  res.status(400).json({ message: 'Error al procesar la imagen' });
}
