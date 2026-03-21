import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError | Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Prisma known request errors (e.g. unique constraint, foreign key, not found)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res.status(409).json({ message: 'A record with this information already exists.' });
        return;
      case 'P2025':
        res.status(404).json({ message: 'The requested record was not found.' });
        return;
      case 'P2003':
        res.status(400).json({ message: 'Related record not found. Please check the provided IDs.' });
        return;
      case 'P2014':
        res.status(400).json({ message: 'Invalid relation — the referenced record does not exist.' });
        return;
      default:
        logger.error(`Prisma error ${err.code}:`, err);
        res.status(500).json({ message: 'A database error occurred. Please try again.' });
        return;
    }
  }

  // Handle Prisma validation errors (malformed queries)
  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error:', err);
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const appErr = err as AppError;
  const statusCode = appErr.statusCode || 500;
  const message = appErr.isOperational ? appErr.message : 'Internal server error';

  if (!appErr.isOperational) {
    logger.error('Unexpected error:', err);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: appErr.stack }),
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
