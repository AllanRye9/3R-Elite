import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Use in-memory storage so converted documents are never persisted to disk.
const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['text/plain', 'text/csv', 'text/markdown'];
    const allowedExts = /\.(txt|csv|md)$/i;
    if (allowedMimes.includes(file.mimetype) || allowedExts.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only plain-text, CSV, and Markdown files are supported'));
    }
  },
});

interface ParsedListing {
  title: string;
  description: string;
  price: number | null;
  currency: string;
  condition: string;
  location: string;
  country: string;
}

const CURRENCY_PATTERN = 'AED|UGX|KES|CNY';

/**
 * Best-effort parser: scans the document line by line looking for common
 * "Key: Value" patterns used in product listing documents.  Lines that do
 * not match a recognised key are collected as fallback title/description.
 */
function parseDocumentText(text: string): ParsedListing {
  const result: ParsedListing = {
    title: '',
    description: '',
    price: null,
    currency: 'AED',
    condition: 'USED',
    location: '',
    country: 'UAE',
  };

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const unmatched: string[] = [];

  for (const line of lines) {
    const kv = line.match(/^([\w\s]+):\s*(.+)$/);
    if (!kv) {
      unmatched.push(line);
      continue;
    }

    const key = kv[1].trim().toLowerCase();
    const val = kv[2].trim();

    if (/^(title|name|product|item)$/.test(key)) {
      result.title = val;
    } else if (/^(price|cost|amount|value)$/.test(key)) {
      const m = val.match(/([\d,]+\.?\d*)/);
      if (m) result.price = parseFloat(m[1].replace(/,/g, ''));
      const cur = val.match(new RegExp(`\\b(${CURRENCY_PATTERN})\\b`, 'i'));
      if (cur) result.currency = cur[1].toUpperCase();
    } else if (/^(description|details|about|info)$/.test(key)) {
      result.description = val;
    } else if (/^(condition|state|quality)$/.test(key)) {
      result.condition = /new/i.test(val) ? 'NEW' : 'USED';
    } else if (/^(location|city|area|zone)$/.test(key)) {
      result.location = val;
    } else if (/^(country|nation)$/.test(key)) {
      const norm = val.toLowerCase();
      if (/uae|emirates|dubai|abu.?dhabi/.test(norm)) result.country = 'UAE';
      else if (/uganda|kampala/.test(norm)) result.country = 'UGANDA';
      else if (/kenya|nairobi/.test(norm)) result.country = 'KENYA';
      else if (/china|beijing|shanghai/.test(norm)) result.country = 'CHINA';
    } else if (/^(currency)$/.test(key)) {
      const valid = CURRENCY_PATTERN.split('|');
      if (valid.includes(val.toUpperCase())) result.currency = val.toUpperCase();
    } else {
      unmatched.push(line);
    }
  }

  // Fallbacks from lines that did not match a key-value pattern.
  if (!result.title && unmatched.length > 0) {
    result.title = unmatched.shift()!;
  }
  if (!result.description && unmatched.length > 0) {
    result.description = unmatched.join('\n');
  }

  // Last-resort price scan across full text.
  if (result.price === null) {
    const m = text.match(
      new RegExp(`(?:${CURRENCY_PATTERN})?\\s*([\\d,]+\\.?\\d*)|([\\d,]+\\.?\\d*)\\s*(?:${CURRENCY_PATTERN})`, 'i'),
    );
    if (m) {
      const raw = m[1] ?? m[2];
      result.price = parseFloat(raw.replace(/,/g, ''));
    }
  }

  return result;
}

/**
 * POST /api/doc/convert
 *
 * Converts a plain-text listing document into structured listing fields.
 * Accepts either:
 *   • multipart/form-data with a `document` file field (.txt / .csv / .md)
 *   • application/json with a `text` string field
 *
 * Returns the parsed listing draft so the frontend can pre-fill the create
 * listing form without requiring the user to re-type everything.
 */
router.post(
  '/convert',
  authenticate,
  // If the client sends JSON, skip multer entirely.
  (req: Request, res: Response, next: NextFunction) => {
    if (req.is('application/json')) return next();
    docUpload.single('document')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        return next(createError(err.message, 400));
      }
      if (err) {
        return next(createError((err as Error).message || 'Upload failed', 400));
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let text: string;
      const multerReq = req as Request & { file?: Express.Multer.File };

      if (multerReq.file) {
        text = multerReq.file.buffer.toString('utf-8');
      } else if (req.body?.text) {
        text = String(req.body.text);
      } else {
        return next(createError('Provide a document file (multipart field "document") or a JSON body with a "text" field', 400));
      }

      if (text.length > 50_000) {
        return next(createError('Document too large – maximum 50,000 characters', 400));
      }

      const parsed = parseDocumentText(text);

      res.json(parsed);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
