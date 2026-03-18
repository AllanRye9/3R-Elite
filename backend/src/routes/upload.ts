import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../utils/prisma';

const router = Router();

// Ensure temp uploads directory exists (not publicly listed, UUID filenames)
const tempUploadsDir = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) => {
    cb(null, tempUploadsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, and GIF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.post(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('images', 10)(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        return next(createError(err.message, 400));
      } else if (err) {
        return next(createError((err as Error).message || 'Upload failed', 400));
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
      }

      const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

      // Create a ProductImage record for each uploaded file.
      const imageRecords = await Promise.all(
        files.map((f) =>
          prisma.productImage.create({
            data: {
              sellerId: req.user!.userId,
              tempPath: f.filename,
              status: 'PENDING',
            },
          }),
        ),
      );

      const imageIds = imageRecords.map((r) => r.id);
      // Provide temp preview URLs (UUID-named, unguessable) for immediate display.
      const previewUrls = files.map((f) => `${baseUrl}/uploads/temp/${f.filename}`);

      res.json({ imageIds, urls: previewUrls });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
